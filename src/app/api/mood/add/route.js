import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";

export async function POST(req) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { mood, activities, notes } = await req.json();

    await connectDB();

    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Add new mood entry
    user.moodEntries.push({
      mood,
      activities,
      notes,
      date: new Date(),
    });

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Mood entry added successfully",
    });
  } catch (error) {
    console.error("Add mood error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
