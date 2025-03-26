import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import User from "@/models/User";
import RiskAssessment from "@/models/RiskAssessment";
import EmergencyContact from "@/models/EmergencyContact";
import connectDB from "@/lib/mongodb";
import OpenAI from "openai";
import { sendEmergencyAlert } from "@/lib/email";
import { sendEmergencySMS } from "@/lib/twilio";

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
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            'You are a mental health risk assessment AI expert. Analyze the provided text for signs of suicidal ideation, self-harm, depression, anxiety, social isolation, and hopelessness. Respond with a JSON object containing a risk score (0-100), array of concerns, and explanation. Do not include any markdown formatting or code blocks in your response. Example response format: {"score": 25, "concerns": ["mild anxiety"], "explanation": "Shows some signs of anxiety"}',
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

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's mood entries for the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const moodEntries = user.moodEntries
      .filter((entry) => new Date(entry.createdAt) >= thirtyDaysAgo)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Prepare data for AI analysis
    const moodData = moodEntries.map((entry) => ({
      date: entry.createdAt,
      mood: entry.mood,
      activities: entry.activities,
      notes: entry.notes,
      sleep: entry.sleepQuality,
      stress: entry.stressLevel,
      energy: entry.energyLevel,
      social: entry.socialInteractionCount,
    }));

    // Generate AI risk assessment
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a mental health risk assessment AI assistant. Analyze the user's mood patterns and provide a comprehensive risk assessment. Focus on identifying risk factors, trends, and early warning signs. Format your response as a JSON object with the following structure: { riskLevel: string, score: number, factors: [{ name: string, type: string, score: number, description: string, concerns: string[], trend: string, correlation: string }], trends: [{ name: string, direction: string, strength: string, timeframe: string, impact: string }], earlyWarnings: [{ type: string, description: string, severity: string, actionItems: [{ step: string, description: string }] }], historicalComparison: { previousScore: number, change: string, significantChanges: string[] }, correlations: [{ factor1: string, factor2: string, strength: string, impact: string, description: string }] }. For riskLevel, use: 'low', 'medium', 'high', or 'critical'. For scores, use numbers between 0-100. For severity, use: 'low', 'medium', 'high', or 'critical'. For strength and impact, use descriptive terms (e.g., 'strong', 'moderate', 'weak').",
        },
        {
          role: "user",
          content: `Please analyze this mood data and provide a comprehensive risk assessment: ${JSON.stringify(
            moodData
          )}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Parse AI response into structured risk assessment
    const aiResponse = completion.choices[0].message.content;
    let parsedResponse;
    try {
      // Clean up the response by removing markdown code block formatting
      const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, "").trim();
      parsedResponse = JSON.parse(cleanedResponse);
    } catch (error) {
      console.error("Error parsing AI response:", error);
      parsedResponse = {
        riskLevel: "low",
        score: 0,
        factors: [],
        trends: [],
        earlyWarnings: [],
        historicalComparison: {
          previousScore: 0,
          change: "stable",
          significantChanges: [],
        },
        correlations: [],
      };
    }

    // Add metadata and icons to each risk factor
    const riskAssessment = {
      ...parsedResponse,
      factors: parsedResponse.factors.map((factor) => ({
        ...factor,
        icon: getFactorIcon(factor.type),
        color: getFactorColor(factor.type),
      })),
      trends: parsedResponse.trends.map((trend) => ({
        ...trend,
        icon: getTrendIcon(trend.direction),
        color: getTrendColor(trend.direction),
      })),
      earlyWarnings: parsedResponse.earlyWarnings.map((warning) => ({
        ...warning,
        icon: getWarningIcon(warning.severity),
        color: getWarningColor(warning.severity),
      })),
    };

    return NextResponse.json({
      success: true,
      riskAssessment,
      timeRange: "Last 30 days",
    });
  } catch (error) {
    console.error("Get risk assessment error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// Helper functions for icons and colors
function getFactorIcon(type) {
  switch (type) {
    case "mood":
      return "heart";
    case "sleep":
      return "moon";
    case "stress":
      return "exclamation";
    case "social":
      return "user-group";
    case "activity":
      return "bolt";
    default:
      return "chart";
  }
}

function getFactorColor(type) {
  switch (type) {
    case "mood":
      return "purple";
    case "sleep":
      return "blue";
    case "stress":
      return "red";
    case "social":
      return "green";
    case "activity":
      return "orange";
    default:
      return "gray";
  }
}

function getTrendIcon(direction) {
  switch (direction) {
    case "increasing":
      return "arrow-trending-up";
    case "decreasing":
      return "arrow-trending-down";
    case "stable":
      return "arrow-path";
    default:
      return "chart";
  }
}

function getTrendColor(direction) {
  switch (direction) {
    case "increasing":
      return "green";
    case "decreasing":
      return "red";
    case "stable":
      return "blue";
    default:
      return "gray";
  }
}

function getWarningIcon(severity) {
  switch (severity) {
    case "critical":
      return "exclamation-triangle";
    case "high":
      return "exclamation-circle";
    case "medium":
      return "information-circle";
    case "low":
      return "bell";
    default:
      return "information-circle";
  }
}

function getWarningColor(severity) {
  switch (severity) {
    case "critical":
      return "red";
    case "high":
      return "orange";
    case "medium":
      return "yellow";
    case "low":
      return "blue";
    default:
      return "gray";
  }
}
