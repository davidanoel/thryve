import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";

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

    // Get mood entries sorted by date
    const moodEntries = user.moodEntries
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 30); // Get last 30 entries

    return NextResponse.json({
      success: true,
      moodEntries,
    });
  } catch (error) {
    console.error("Get mood history error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
