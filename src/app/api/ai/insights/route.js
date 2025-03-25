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

    // Get recent mood entries
    const recentEntries = user.moodEntries
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    // Prepare data for AI analysis
    const moodData = recentEntries.map((entry) => ({
      date: new Date(entry.createdAt).toISOString().split("T")[0],
      mood: entry.mood,
      activities: entry.activities,
      notes: entry.notes,
      sleepQuality: entry.sleepQuality,
      energyLevel: entry.energyLevel,
      socialInteractionCount: entry.socialInteractionCount,
      stressLevel: entry.stressLevel,
    }));

    // Generate AI insights
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            "You are a mental health and wellness AI assistant. Analyze the user's mood patterns and provide helpful insights and recommendations. Focus on identifying trends, potential triggers, and suggesting evidence-based strategies for improving mental well-being.",
        },
        {
          role: "user",
          content: `Please analyze this mood data and provide 3 key insights or recommendations: ${JSON.stringify(
            moodData
          )}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    // Parse AI response into structured insights
    const aiResponse = completion.choices[0].message.content;
    const insights = aiResponse.split("\n\n").map((insight) => {
      const [title, ...descriptionParts] = insight.split(":");
      return {
        title: title.trim().replace(/^\d+\.\s*/, ""),
        description: descriptionParts.join(":").trim(),
      };
    });

    return NextResponse.json({
      success: true,
      insights,
    });
  } catch (error) {
    console.error("Get AI insights error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
