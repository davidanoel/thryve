import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";
import OpenAI from "openai";

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

    // Check if user has any mood entries
    if (!user.moodEntries || user.moodEntries.length === 0) {
      return NextResponse.json({
        message: "Please add some mood entries to get insights.",
      });
    }

    // Get user's mood entries for the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const moodEntries = user.moodEntries
      .filter((entry) => new Date(entry.createdAt) >= sevenDaysAgo)
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

    // Generate AI insights
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a mental health and wellness AI assistant. Analyze the user's recent mood patterns (last 7 days) and provide structured insights and recommendations. Focus on identifying immediate trends, potential triggers, and suggesting evidence-based strategies for improving mental well-being. Prioritize high-impact items and urgent recommendations. Format your response as a JSON object with the following structure: { trends: [{ title, description, type, confidence, priority, timeframe }], triggers: [{ title, description, type, impact, priority, confidence, actionItems: [{ step, description }] }], recommendations: [{ title, description, priority, category, confidence, timeframe, actionItems: [{ step, description }] }], patterns: [{ title, description, type, frequency, priority, confidence }] }. Sort items within each category by priority (high, medium, low). For confidence scores, use a number between 0-100. For timeframes, specify when the insight is most relevant (e.g., 'immediate', 'next 24 hours', 'this week') with specific dates if possible. For action items, provide 2-3 specific, actionable steps.",
        },
        {
          role: "user",
          content: `Please analyze this recent mood data and provide structured insights: ${JSON.stringify(
            moodData
          )}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    // Parse AI response into structured insights
    const aiResponse = completion.choices[0].message.content;
    let parsedResponse;
    try {
      // Clean up the response by removing markdown code block formatting
      const cleanedResponse = aiResponse.replace(/```json\n?|\n?```/g, "").trim();
      parsedResponse = JSON.parse(cleanedResponse);
    } catch (error) {
      console.error("Error parsing AI response:", error);
      parsedResponse = {
        trends: [],
        triggers: [],
        recommendations: [],
        patterns: [],
      };
    }

    // Sort items by priority within each category
    const sortByPriority = (items) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    };

    // Add metadata and icons to each insight type, then sort by priority
    const insights = {
      trends: sortByPriority(
        parsedResponse.trends.map((trend) => ({
          ...trend,
          type: "trend",
          icon: "trend",
          color: "blue",
          category: "Trend Analysis",
        }))
      ),
      triggers: sortByPriority(
        parsedResponse.triggers.map((trigger) => ({
          ...trigger,
          type: "trigger",
          icon: "bolt",
          color: "orange",
          category: "Triggers",
        }))
      ),
      recommendations: sortByPriority(
        parsedResponse.recommendations.map((rec) => ({
          ...rec,
          type: "recommendation",
          icon: "sparkles",
          color: "purple",
          category: "Recommendations",
        }))
      ),
      patterns: sortByPriority(
        parsedResponse.patterns.map((pattern) => ({
          ...pattern,
          type: "pattern",
          icon: "chart",
          color: "green",
          category: "Patterns",
        }))
      ),
    };

    return NextResponse.json({
      success: true,
      insights,
      timeRange: "Last 7 days",
    });
  } catch (error) {
    console.error("Get AI insights error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
