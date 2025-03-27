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

    return NextResponse.json({
      goals: user.goals || [],
    });
  } catch (error) {
    console.error("Error in GET /api/goals:", error);
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
    const { title, description, type, target, deadline } = body;

    // Validate required fields
    if (!title || !type || !target) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate goal type
    const validTypes = ["mood", "sleep", "activity", "social"];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid goal type" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Initialize goals array if it doesn't exist
    if (!user.goals) {
      user.goals = [];
    }

    // Create new goal
    user.goals.push({
      title,
      description,
      type,
      target,
      deadline: deadline ? new Date(deadline) : undefined,
      progress: 0,
      status: "active",
      createdAt: new Date(),
    });

    await user.save();
    return NextResponse.json({
      message: "Goal created successfully",
      goal: user.goals[user.goals.length - 1],
    });
  } catch (error) {
    console.error("Error in POST /api/goals:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { goalId, updates } = body;

    if (!goalId || !updates) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

    // Update goal fields
    Object.keys(updates).forEach((key) => {
      if (key === "deadline") {
        user.goals[goalIndex][key] = updates[key] ? new Date(updates[key]) : undefined;
      } else {
        user.goals[goalIndex][key] = updates[key];
      }
    });

    await user.save();
    return NextResponse.json({ message: "Goal updated successfully", goal: user.goals[goalIndex] });
  } catch (error) {
    console.error("Error in PUT /api/goals:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const goalId = searchParams.get("goalId");

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

    user.goals.splice(goalIndex, 1);
    await user.save();

    return NextResponse.json({ message: "Goal deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/goals:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
