import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 30;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.moodEntries || user.moodEntries.length === 0) {
      return NextResponse.json({
        message: "No mood entries found. Please add some entries to get analytics.",
      });
    }

    // Get last 90 days of mood data for comprehensive analysis
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Filter mood entries from the last 90 days
    const moodEntries = user.moodEntries
      .filter((entry) => new Date(entry.createdAt) >= ninetyDaysAgo)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Prepare data for AI analysis
    const moodData = moodEntries.map((entry) => ({
      date: entry.createdAt,
      mood: entry.mood,
      activities: entry.activities,
      notes: entry.notes,
      sleepQuality: entry.sleepQuality,
      stressLevel: entry.stressLevel,
      energyLevel: entry.energyLevel,
      socialInteractionCount: entry.socialInteractionCount,
    }));

    // Generate advanced analytics using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert mental health data analyst. Analyze the provided mood data and generate insights in the following JSON format:
          {
            "correlations": [
              {
                "factors": ["string (array of correlated factors)"],
                "correlation": number,
                "strength": "strong|moderate|weak",
                "description": "string"
              }
            ],
            "patterns": [
              {
                "type": "daily|weekly|monthly",
                "description": "string",
                "confidence": number,
                "impact": "high|medium|low",
                "recommendations": ["string"]
              }
            ],
            "seasonalTrends": [
              {
                "period": "morning|afternoon|evening|weekday|weekend",
                "averageMood": number,
                "trend": "improving|stable|declining",
                "factors": ["string"],
                "suggestions": ["string"]
              }
            ],
            "activityImpact": [
              {
                "activity": "string",
                "moodImpact": number,
                "frequency": number,
                "recommendation": "string"
              }
            ],
            "summary": {
              "overallTrend": "improving|stable|declining",
              "keyFindings": ["string"],
              "recommendations": ["string"]
            }
          }`,
        },
        {
          role: "user",
          content: JSON.stringify(moodData),
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const analysis = JSON.parse(completion.choices[0].message.content);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error in advanced analytics:", error);
    return NextResponse.json({ error: "Failed to generate advanced analytics" }, { status: 500 });
  }
}
