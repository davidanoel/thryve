import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import CrisisPlan from "@/models/CrisisPlan";

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const crisisPlan = await CrisisPlan.findOne({ userId: session.userId });

    return NextResponse.json(crisisPlan || null);
  } catch (error) {
    console.error("Error fetching crisis plan:", error);
    return NextResponse.json({ error: "Failed to fetch crisis plan" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    await connectDB();

    const crisisPlan = new CrisisPlan({
      userId: session.userId,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await crisisPlan.save();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating crisis plan:", error);
    return NextResponse.json({ error: "Failed to create crisis plan" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    await connectDB();

    const result = await CrisisPlan.findOneAndUpdate(
      { userId: session.userId },
      {
        ...data,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      message: "Crisis plan updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating crisis plan:", error);
    return NextResponse.json({ error: "Failed to update crisis plan" }, { status: 500 });
  }
}
