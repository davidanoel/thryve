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

    // Get recent mood entries with all metrics
    const recentEntries = user.moodEntries
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 30); // Get last 30 entries for better pattern recognition

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

    // Generate AI predictions and patterns
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a mental health analytics AI. Analyze the user's mood data and provide:
1. Pattern Recognition: Identify recurring patterns in mood, sleep, energy, and stress levels
2. Predictive Insights: Based on the patterns, predict potential mood trends
3. Correlation Analysis: Identify relationships between different factors (e.g., sleep quality and mood)
4. Recommendations: Suggest specific actions to improve mental well-being based on the analysis

Format your response as a JSON object with the following structure:
{
  "patterns": [
    {
      "type": "mood|sleep|energy|stress|activity",
      "description": "Description of the pattern",
      "confidence": "high|medium|low"
    }
  ],
  "predictions": [
    {
      "factor": "mood|sleep|energy|stress|activity",
      "trend": "improving|declining|stable",
      "confidence": "high|medium|low",
      "explanation": "Explanation of the prediction"
    }
  ],
  "correlations": [
    {
      "factors": ["factor1", "factor2"],
      "strength": "strong|moderate|weak",
      "description": "Description of the correlation"
    }
  ],
  "recommendations": [
    {
      "action": "Specific action to take",
      "impact": "Expected impact on mental well-being",
      "priority": "high|medium|low"
    }
  ]
}`,
        },
        {
          role: "user",
          content: `Please analyze this mood data and provide predictions and patterns: ${JSON.stringify(
            moodData
          )}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Parse AI response
    const responseContent = completion.choices[0].message.content;
    // Clean the response by removing markdown code block formatting
    const cleanedContent = responseContent.replace(/```json\n?|\n?```/g, "").trim();
    const analysis = JSON.parse(cleanedContent);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Get AI predictions error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
