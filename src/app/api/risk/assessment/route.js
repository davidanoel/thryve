import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import User from "@/models/User";
import EmergencyContact from "@/models/EmergencyContact";
import connectDB from "@/lib/mongodb";
import OpenAI from "openai";
import { sendEmergencyNotification } from "@/lib/notifications";

export const runtime = "nodejs";
export const maxDuration = 30;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
      max_tokens: 800,
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

    // Check if emergency notifications should be sent
    if (riskAssessment.riskLevel === "critical" || riskAssessment.riskLevel === "high") {
      try {
        // Get user's emergency contacts with populated data
        const userWithContacts = await User.findById(session.userId).populate({
          path: "emergencyContacts",
          model: EmergencyContact,
        });

        const emergencyContacts = userWithContacts.emergencyContacts || [];

        // Filter for verified contacts only
        const verifiedContacts = emergencyContacts.filter((contact) => contact.isVerified);

        // Send notifications to all verified contacts for critical risk, primary contact for high risk
        const contactsToNotify =
          riskAssessment.riskLevel === "critical" ? verifiedContacts : verifiedContacts.slice(0, 1);

        // Send notifications to selected contacts
        for (const contact of contactsToNotify) {
          await sendEmergencyNotification(contact, user, riskAssessment);
        }
      } catch (error) {
        console.error("Error sending emergency notifications:", error);
        // Continue with the response even if notifications fail
      }
    }

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
