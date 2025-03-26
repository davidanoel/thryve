import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import User from "@/models/User";
import EmergencyContact from "@/models/EmergencyContact";
import connectDB from "@/lib/mongodb";
import crypto from "crypto";

// Helper function to generate verification code
function generateVerificationCode() {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();

    const contacts = await EmergencyContact.find({ userId: session.userId });

    return NextResponse.json({
      success: true,
      contacts,
    });
  } catch (error) {
    console.error("Get emergency contacts error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { name, relationship, phone, email, notificationPreferences } = body;

    if (!name || !relationship || !phone || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date();
    verificationExpires.setHours(verificationExpires.getHours() + 24);

    const contact = await EmergencyContact.create({
      userId: session.userId,
      name,
      relationship,
      phone,
      email,
      notificationPreferences: notificationPreferences || {
        alertThreshold: "critical",
        methods: ["email"],
      },
      verificationCode,
      verificationExpires,
    });

    // TODO: Send verification email to emergency contact
    // This would typically be handled by an email service

    return NextResponse.json({
      success: true,
      contact: {
        ...contact.toObject(),
        verificationCode: undefined, // Don't send verification code in response
      },
    });
  } catch (error) {
    console.error("Add emergency contact error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { contactId, updates } = body;

    if (!contactId || !updates) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const contact = await EmergencyContact.findOne({
      _id: contactId,
      userId: session.userId,
    });

    if (!contact) {
      return NextResponse.json({ error: "Emergency contact not found" }, { status: 404 });
    }

    // Update allowed fields
    const allowedUpdates = [
      "name",
      "relationship",
      "phone",
      "email",
      "notificationPreferences",
      "notes",
    ];

    allowedUpdates.forEach((field) => {
      if (updates[field] !== undefined) {
        contact[field] = updates[field];
      }
    });

    await contact.save();

    return NextResponse.json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error("Update emergency contact error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const contactId = searchParams.get("id");

    if (!contactId) {
      return NextResponse.json({ error: "Contact ID is required" }, { status: 400 });
    }

    await connectDB();

    const result = await EmergencyContact.deleteOne({
      _id: contactId,
      userId: session.userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Emergency contact not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Emergency contact deleted successfully",
    });
  } catch (error) {
    console.error("Delete emergency contact error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
