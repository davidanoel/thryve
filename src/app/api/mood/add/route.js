import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";

export async function POST(req) {
  try {
    const session = await getServerSession();

    if (!session) {
      return NextResponse.json(
        { error: "You must be logged in to add a mood entry." },
        { status: 401 }
      );
    }

    await connectDB();

    const {
      mood,
      activities,
      notes,
      sleepQuality,
      energyLevel,
      socialInteractionCount,
      stressLevel,
    } = await req.json();

    // Validate required fields
    if (!mood || !sleepQuality || !energyLevel || !socialInteractionCount || !stressLevel) {
      return NextResponse.json({ error: "Please provide all required fields." }, { status: 400 });
    }

    // Find user and add mood entry
    const user = await User.findById(session.userId);

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Ensure activities is an array of objects with the correct structure
    const formattedActivities = Array.isArray(activities)
      ? activities.map((activity) => ({
          name: activity.name || activity,
          duration: activity.duration || 30,
          isSocial: activity.isSocial || false,
        }))
      : [];

    // Create the mood entry
    const moodEntry = {
      mood,
      activities: formattedActivities,
      notes,
      sleepQuality,
      energyLevel,
      socialInteractionCount,
      stressLevel,
    };

    // Add the mood entry to the user's moodEntries array
    user.moodEntries.push(moodEntry);

    // Save the user document
    const savedUser = await user.save();

    return NextResponse.json(
      {
        message: "Mood entry added successfully.",
        moodEntry: savedUser.moodEntries[savedUser.moodEntries.length - 1],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding mood entry:", error);
    return NextResponse.json(
      {
        error: "Error adding mood entry.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
