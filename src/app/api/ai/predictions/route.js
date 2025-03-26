import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";
import OpenAI from "openai";

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

    // Generate AI predictions
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a mental health and wellness AI assistant specializing in pattern recognition and predictive analysis. Analyze the user's mood patterns over the last 30 days to identify long-term trends, seasonal patterns, and potential future developments. Focus on deeper correlations and predictive insights. Prioritize high-impact patterns and significant predictions. Format your response as a JSON object with the following structure: { predictions: [{ title, description, confidence, timeframe, priority }], patterns: [{ title, description, type, strength, priority }], correlations: [{ title, description, impact, confidence, priority }], recommendations: [{ title, description, timeframe, priority }] }. Sort items within each category by priority (high, medium, low).",
        },
        {
          role: "user",
          content: `Please analyze this 30-day mood data and provide predictive insights: ${JSON.stringify(
            moodData
          )}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Parse AI response into structured predictions
    const aiResponse = completion.choices[0].message.content;
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (error) {
      console.error("Error parsing AI response:", error);
      parsedResponse = {
        predictions: [],
        patterns: [],
        correlations: [],
        recommendations: [],
      };
    }

    // Sort items by priority within each category
    const sortByPriority = (items) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    };

    // Add metadata and icons to each prediction type, then sort by priority
    const predictions = {
      predictions: sortByPriority(
        parsedResponse.predictions.map((pred) => ({
          ...pred,
          type: "prediction",
          icon: "chart",
          color: "indigo",
          category: "Future Predictions",
        }))
      ),
      patterns: sortByPriority(
        parsedResponse.patterns.map((pattern) => ({
          ...pattern,
          type: "pattern",
          icon: "chart-bar",
          color: "blue",
          category: "Long-term Patterns",
        }))
      ),
      correlations: sortByPriority(
        parsedResponse.correlations.map((corr) => ({
          ...corr,
          type: "correlation",
          icon: "link",
          color: "green",
          category: "Key Correlations",
        }))
      ),
      recommendations: sortByPriority(
        parsedResponse.recommendations.map((rec) => ({
          ...rec,
          type: "recommendation",
          icon: "sparkles",
          color: "purple",
          category: "Strategic Recommendations",
        }))
      ),
    };

    return NextResponse.json({
      success: true,
      predictions,
      timeRange: "Last 30 days",
    });
  } catch (error) {
    console.error("Get AI predictions error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
