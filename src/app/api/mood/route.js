import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

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

    return NextResponse.json({ moodEntries: user.moodEntries || [] });
  } catch (error) {
    console.error("Error in GET /api/mood:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const {
      mood,
      sleepQuality,
      energyLevel,
      activities,
      socialInteractionCount,
      stressLevel,
      notes,
    } = body;

    // Validate required fields
    if (!mood) {
      return NextResponse.json({ error: "Mood is required" }, { status: 400 });
    }

    // Validate mood value
    const validMoods = ["Very Happy", "Happy", "Neutral", "Sad", "Very Sad"];
    if (!validMoods.includes(mood)) {
      return NextResponse.json({ error: "Invalid mood value" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create new mood entry
    const newMoodEntry = {
      mood,
      sleepQuality: sleepQuality || 3,
      energyLevel: energyLevel || 3,
      activities: activities || [],
      socialInteractionCount: socialInteractionCount || 0,
      stressLevel: stressLevel || 3,
      notes: notes || "",
      createdAt: new Date(),
    };

    // Add mood entry to user's history
    if (!user.moodEntries) {
      user.moodEntries = [];
    }
    user.moodEntries.push(newMoodEntry);

    // Get recent entries for goal progress calculation
    const recentEntries = user.moodEntries.slice(-7);

    // Update goal progress
    user.goals.forEach((goal, index) => {
      if (goal.status !== "active") return;

      let progress = 0;
      switch (goal.type) {
        case "mood":
          const avgMood =
            recentEntries.reduce((sum, entry) => {
              const moodValue = {
                "Very Happy": 5,
                Happy: 4,
                Neutral: 3,
                Sad: 2,
                "Very Sad": 1,
              }[entry.mood];
              return sum + moodValue;
            }, 0) / recentEntries.length;
          progress = (avgMood / goal.target) * 100;
          break;

        case "sleep":
          const avgSleep =
            recentEntries.reduce((sum, entry) => sum + entry.sleepQuality, 0) /
            recentEntries.length;
          progress = (avgSleep / goal.target) * 100;
          break;

        case "social":
          const avgSocial =
            recentEntries.reduce((sum, entry) => sum + entry.socialInteractionCount, 0) /
            recentEntries.length;
          progress = (avgSocial / goal.target) * 100;
          break;

        case "activity":
          const avgActivities =
            recentEntries.reduce((sum, entry) => sum + entry.activities.length, 0) /
            recentEntries.length;
          progress = (avgActivities / goal.target) * 100;
          break;
      }

      // Update progress and check if goal is completed
      user.goals[index].progress = Math.min(Math.max(progress, 0), 100);
      if (user.goals[index].progress >= 100 && !user.goals[index].completedAt) {
        user.goals[index].status = "completed";
        user.goals[index].completedAt = new Date();
      }
    });

    await user.save();
    return NextResponse.json({ message: "Mood entry added successfully", moodEntry: newMoodEntry });
  } catch (error) {
    console.error("Error in POST /api/mood:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
