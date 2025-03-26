import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import User from "@/models/User";
import EmergencyContact from "@/models/EmergencyContact";
import connectDB from "@/lib/mongodb";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";
import { sendEmergencySMS } from "@/lib/twilio";

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
        methods: ["email", "sms"],
      },
      verificationCode,
      verificationExpires,
    });

    // Send verification email using Resend
    const emailSent = await sendVerificationEmail(contact);
    if (!emailSent) {
      console.warn("Failed to send verification email to:", email);
    }

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

export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const data = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Contact ID is required" }, { status: 400 });
    }

    await connectDB();

    // Find the existing contact
    const existingContact = await EmergencyContact.findById(id);
    if (!existingContact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    // If email is being changed and the contact was verified, reset verification
    if (data.email !== existingContact.email && existingContact.isVerified) {
      data.isVerified = false;
      data.verificationToken = Math.random().toString(36).substring(2);
      data.verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    }

    // Update the contact
    const updatedContact = await EmergencyContact.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    );

    // If email was changed and contact was previously verified, send new verification email
    if (data.email !== existingContact.email && existingContact.isVerified) {
      await sendVerificationEmail(data.email, data.verificationToken);
    }

    return NextResponse.json({ contact: updatedContact });
  } catch (error) {
    console.error("Error updating emergency contact:", error);
    return NextResponse.json({ error: "Failed to update emergency contact" }, { status: 500 });
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
