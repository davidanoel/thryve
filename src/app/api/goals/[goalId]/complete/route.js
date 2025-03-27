import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { goalId } = params;
    if (!goalId) {
      return NextResponse.json({ error: "Goal ID is required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const goalIndex = user.goals.findIndex((g) => g._id.toString() === goalId);
    if (goalIndex === -1) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    // Update goal status to completed
    user.goals[goalIndex].status = "completed";
    user.goals[goalIndex].completedAt = new Date();

    await user.save();
    return NextResponse.json({
      message: "Goal completed successfully",
      goal: user.goals[goalIndex],
    });
  } catch (error) {
    console.error("Error completing goal:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
