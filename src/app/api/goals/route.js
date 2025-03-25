import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

// Helper function to generate recommendations based on goals and mood entries
function generateRecommendations(goals, moodEntries) {
  const recentEntries = moodEntries.slice(-7);
  if (recentEntries.length === 0) {
    return [];
  }

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

  const avgSleep =
    recentEntries.reduce((sum, entry) => sum + entry.sleepQuality, 0) / recentEntries.length;

  const avgSocial =
    recentEntries.reduce((sum, entry) => sum + entry.socialInteractionCount, 0) /
    recentEntries.length;

  const recommendations = [];

  // Analyze each active goal
  goals.forEach((goal) => {
    if (goal.status !== "active") return;

    switch (goal.type) {
      case "mood":
        if (avgMood < goal.target) {
          recommendations.push({
            type: "mood",
            message:
              "Your mood has been lower than your target. Try incorporating more activities you enjoy and practicing self-care.",
            priority: "high",
          });
        }
        break;

      case "sleep":
        if (avgSleep < goal.target) {
          recommendations.push({
            type: "sleep",
            message:
              "Your sleep quality is below your goal. Consider establishing a consistent bedtime routine and limiting screen time before bed.",
            priority: "high",
          });
        }
        break;

      case "social":
        if (avgSocial < goal.target) {
          recommendations.push({
            type: "social",
            message:
              "You're below your social interaction goal. Try reaching out to friends or joining group activities.",
            priority: "medium",
          });
        }
        break;

      case "activity":
        const avgActivities =
          recentEntries.reduce((sum, entry) => sum + entry.activities.length, 0) /
          recentEntries.length;
        if (avgActivities < goal.target) {
          recommendations.push({
            type: "activity",
            message:
              "You're not meeting your activity target. Consider scheduling regular activities throughout your day.",
            priority: "medium",
          });
        }
        break;
    }
  });

  // Add general recommendations based on mood patterns
  if (avgMood <= 2) {
    recommendations.push({
      type: "general",
      message:
        "Your mood has been consistently low. Consider speaking with a mental health professional.",
      priority: "high",
    });
  }

  if (avgSleep <= 3) {
    recommendations.push({
      type: "general",
      message: "Poor sleep can significantly impact mood. Focus on improving your sleep hygiene.",
      priority: "high",
    });
  }

  return recommendations;
}

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

    const recommendations = generateRecommendations(user.goals || [], user.moodEntries || []);

    return NextResponse.json({
      goals: user.goals || [],
      recommendations,
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
