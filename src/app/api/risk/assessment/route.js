import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import User from "@/models/User";
import RiskAssessment from "@/models/RiskAssessment";
import EmergencyContact from "@/models/EmergencyContact";
import connectDB from "@/lib/mongodb";
import OpenAI from "openai";
import { sendEmergencyAlert } from "@/lib/email";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Risk scoring weights
const RISK_WEIGHTS = {
  mood: 0.35,
  language: 0.25,
  sleep: 0.15,
  social: 0.15,
  stress: 0.1,
};

// Risk level thresholds
const RISK_THRESHOLDS = {
  low: 25,
  medium: 50,
  high: 75,
  critical: 90,
};

// Helper function to analyze text for concerning patterns
async function analyzeLanguage(text) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            'You are a mental health risk assessment AI. Analyze the provided text for signs of suicidal ideation, self-harm, depression, anxiety, social isolation, and hopelessness. Respond with a JSON object containing a risk score (0-100), array of concerns, and explanation. Do not include any markdown formatting or code blocks in your response. Example response format: {"score": 25, "concerns": ["mild anxiety"], "explanation": "Shows some signs of anxiety"}',
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content;
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parsing error:", parseError, "Response:", responseText);
      return {
        score: 0,
        concerns: ["Error parsing analysis"],
        explanation: "Unable to process text analysis",
      };
    }
  } catch (error) {
    console.error("Language analysis error:", error);
    return {
      score: 0,
      concerns: [],
      explanation: "Error analyzing text",
    };
  }
}

// Calculate risk score from mood entries
function calculateMoodRisk(entries) {
  if (!entries.length) return { score: 0, description: "No mood data available", concerns: [] };

  const recentEntries = entries.slice(-14); // Last 2 weeks
  const moodScores = recentEntries.map((entry) => {
    const moodValues = {
      "Very Happy": 0,
      Happy: 25,
      Neutral: 50,
      Sad: 75,
      "Very Sad": 100,
    };
    return moodValues[entry.mood] || 50;
  });

  const avgScore = moodScores.reduce((a, b) => a + b, 0) / moodScores.length;
  const volatility = calculateVolatility(moodScores);
  const downwardTrend = detectDownwardTrend(moodScores);

  const finalScore = avgScore * 0.6 + volatility * 0.2 + (downwardTrend ? 20 : 0);

  const concerns = [];
  if (avgScore > 75) concerns.push("Consistently low mood");
  if (volatility > 50) concerns.push("High mood volatility");
  if (downwardTrend) concerns.push("Declining mood trend");

  return {
    score: Math.min(100, finalScore),
    description: `Based on ${recentEntries.length} recent entries. ${
      downwardTrend ? "Showing downward trend. " : ""
    }Volatility: ${volatility.toFixed(1)}`,
    concerns,
  };
}

// Helper function to calculate mood volatility
function calculateVolatility(scores) {
  if (scores.length < 2) return 0;
  const changes = scores.slice(1).map((score, i) => Math.abs(score - scores[i]));
  return changes.reduce((a, b) => a + b, 0) / changes.length / 25; // Normalize to 0-100
}

// Helper function to detect downward trend
function detectDownwardTrend(scores) {
  if (scores.length < 7) return false;
  const recentAvg = scores.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const previousAvg = scores.slice(-7, -3).reduce((a, b) => a + b, 0) / 4;
  return recentAvg > previousAvg + 15; // 15 point increase in risk score indicates downward mood trend
}

// Calculate sleep risk
function calculateSleepRisk(entries) {
  if (!entries.length) return { score: 0, description: "No sleep data available", concerns: [] };

  const recentEntries = entries.slice(-7); // Last week
  const avgSleep =
    recentEntries.reduce((sum, entry) => sum + entry.sleepQuality, 0) / recentEntries.length;
  const score = Math.max(0, 100 - avgSleep * 20); // Convert 1-5 scale to 0-100 risk score

  const concerns = [];
  if (avgSleep < 3) concerns.push("Poor sleep quality");
  if (avgSleep < 2) concerns.push("Severe sleep issues");

  return {
    score,
    description: `Average sleep quality: ${avgSleep.toFixed(1)}/5`,
    concerns,
  };
}

// Calculate social isolation risk
function calculateSocialRisk(entries) {
  if (!entries.length) return { score: 0, description: "No social data available", concerns: [] };

  const recentEntries = entries.slice(-7);
  const avgSocial =
    recentEntries.reduce((sum, entry) => sum + entry.socialInteractionCount, 0) /
    recentEntries.length;
  const score = Math.max(0, 100 - avgSocial * 10); // Convert 0-10 scale to 0-100 risk score

  const concerns = [];
  if (avgSocial < 2) concerns.push("Limited social interaction");
  if (avgSocial < 1) concerns.push("Social isolation");

  return {
    score,
    description: `Average daily social interactions: ${avgSocial.toFixed(1)}`,
    concerns,
  };
}

// Calculate stress risk
function calculateStressRisk(entries) {
  if (!entries.length) return { score: 0, description: "No stress data available", concerns: [] };

  const recentEntries = entries.slice(-7);
  const avgStress =
    recentEntries.reduce((sum, entry) => sum + entry.stressLevel, 0) / recentEntries.length;
  const score = avgStress * 20; // Convert 1-5 scale to 0-100 risk score

  const concerns = [];
  if (avgStress > 3) concerns.push("Elevated stress levels");
  if (avgStress > 4) concerns.push("Severe stress");

  return {
    score,
    description: `Average stress level: ${avgStress.toFixed(1)}/5`,
    concerns,
  };
}

// Get risk level based on score
function getRiskLevel(score) {
  if (score >= RISK_THRESHOLDS.critical) return "critical";
  if (score >= RISK_THRESHOLDS.high) return "high";
  if (score >= RISK_THRESHOLDS.medium) return "medium";
  return "low";
}

async function handleRiskAssessment(user, riskScore, riskLevel, riskAssessment) {
  console.log("Risk score:", riskScore);

  // Trigger notifications for high or critical risk
  if (riskLevel === "high" || riskLevel === "critical") {
    try {
      // Get verified emergency contacts
      const contacts = await EmergencyContact.find({
        userId: user._id,
        isVerified: true,
      });

      // Filter contacts based on their notification preferences
      const contactsToNotify = contacts.filter((contact) =>
        contact.notificationPreferences?.alertThreshold === "high"
          ? riskLevel === "high" || riskLevel === "critical"
          : riskLevel === "critical"
      );

      // Send notifications
      for (const contact of contactsToNotify) {
        try {
          await sendEmergencyAlert({
            user,
            contact,
            riskAssessment: {
              riskLevel,
              score: riskScore,
              ...riskAssessment,
            },
          });

          // Update last notified timestamp
          await EmergencyContact.findByIdAndUpdate(contact._id, {
            lastNotified: new Date(),
          });
        } catch (error) {
          console.error("Error sending notification to contact:", error);
        }
      }
    } catch (error) {
      console.error("Failed to send notifications:", error);
    }
  }

  return riskLevel;
}

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get user and their mood entries
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get recent entries (last 10)
    const recentMoods = user.moodEntries
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);

    if (!recentMoods.length) {
      return NextResponse.json({
        riskLevel: "low",
        score: 0,
        factors: [],
        lastAssessment: new Date(),
      });
    }

    // Calculate risk factors
    const moodRisk = calculateMoodRisk(recentMoods);
    const sleepRisk = calculateSleepRisk(recentMoods);
    const socialRisk = calculateSocialRisk(recentMoods);
    const stressRisk = calculateStressRisk(recentMoods);

    // Analyze text content from notes
    const notesText = recentMoods.map((entry) => entry.notes).join(" ");
    const languageAnalysis = await analyzeLanguage(notesText);

    // Calculate overall risk score (weighted average)
    const riskScore = Math.round(
      moodRisk.score * 0.3 +
        languageAnalysis.score * 0.3 +
        sleepRisk.score * 0.15 +
        socialRisk.score * 0.15 +
        stressRisk.score * 0.1
    );

    // Combine all concerns
    const concerns = [
      ...languageAnalysis.concerns,
      ...moodRisk.concerns,
      ...sleepRisk.concerns,
      ...socialRisk.concerns,
      ...stressRisk.concerns,
    ];

    // Determine risk level
    const riskLevel = getRiskLevel(riskScore);

    // Create risk assessment record
    const assessment = await RiskAssessment.create({
      userId: user._id,
      riskLevel,
      score: riskScore,
      factors: [
        {
          type: "mood",
          name: "Mood Patterns",
          score: moodRisk.score,
          concerns: moodRisk.concerns,
          description: moodRisk.description,
        },
        {
          type: "language",
          name: "Language Analysis",
          score: languageAnalysis.score,
          concerns: languageAnalysis.concerns,
          description: languageAnalysis.explanation,
        },
        {
          type: "sleep",
          name: "Sleep Quality",
          score: sleepRisk.score,
          concerns: sleepRisk.concerns,
          description: sleepRisk.description,
        },
        {
          type: "social",
          name: "Social Interaction",
          score: socialRisk.score,
          concerns: socialRisk.concerns,
          description: socialRisk.description,
        },
        {
          type: "stress",
          name: "Stress Levels",
          score: stressRisk.score,
          concerns: stressRisk.concerns,
          description: stressRisk.description,
        },
      ],
      timestamp: new Date(),
    });

    // Handle notifications
    await handleRiskAssessment(user, riskScore, riskLevel, {
      factors: assessment.factors,
      timestamp: assessment.timestamp,
    });

    return NextResponse.json({
      riskLevel,
      score: riskScore,
      factors: assessment.factors,
      lastAssessment: assessment.timestamp,
    });
  } catch (error) {
    console.error("Risk assessment error:", error);
    return NextResponse.json({ error: "Failed to perform risk assessment" }, { status: 500 });
  }
}
