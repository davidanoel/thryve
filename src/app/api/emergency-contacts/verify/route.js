import { NextResponse } from "next/server";
import EmergencyContact from "@/models/EmergencyContact";
import connectDB from "@/lib/mongodb";

export async function POST(req) {
  try {
    const body = await req.json();
    const { contactId, verificationCode } = body;

    if (!contactId || !verificationCode) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();

    const contact = await EmergencyContact.findById(contactId);

    if (!contact) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    if (contact.isVerified) {
      return NextResponse.json({ error: "Contact already verified" }, { status: 400 });
    }

    if (contact.verificationExpires < new Date()) {
      return NextResponse.json({ error: "Verification code expired" }, { status: 400 });
    }

    if (contact.verificationCode !== verificationCode) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    contact.isVerified = true;
    contact.verificationCode = undefined;
    contact.verificationExpires = undefined;
    await contact.save();

    return NextResponse.json({
      success: true,
      message: "Emergency contact verified successfully",
    });
  } catch (error) {
    console.error("Verify emergency contact error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
