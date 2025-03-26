import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import User from "@/models/User";
import EmergencyContact from "@/models/EmergencyContact";
import connectDB from "@/lib/mongodb";
import { sendEmergencyAlert } from "@/lib/email";

export async function POST(req) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { riskAssessment } = body;

    if (!riskAssessment) {
      return NextResponse.json({ error: "Risk assessment data required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findById(session.userId).populate("emergencyContacts");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const notificationsSent = [];
    const errors = [];

    // Filter contacts to notify based on risk level and their preferences
    const contactsToNotify = user.emergencyContacts.filter(
      (contact) =>
        contact.isVerified &&
        (contact.notificationPreferences?.alertThreshold === "high"
          ? riskAssessment.riskLevel === "high" || riskAssessment.riskLevel === "critical"
          : riskAssessment.riskLevel === "critical")
    );
    console.log("Contacts to notify:", contactsToNotify);

    // Send notifications to each contact
    for (const contact of contactsToNotify) {
      try {
        const emailSent = await sendEmergencyAlert({
          user,
          contact,
          riskAssessment,
        });

        if (emailSent) {
          notificationsSent.push(`Email sent to ${contact.email}`);

          // Update last notified timestamp
          await EmergencyContact.findByIdAndUpdate(contact._id, {
            lastNotified: new Date(),
          });
        } else {
          errors.push(`Failed to send email to ${contact.email}`);
        }
      } catch (error) {
        console.error("Error sending notification:", error);
        errors.push(`Error notifying ${contact.name}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      notificationsSent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Send notifications error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
