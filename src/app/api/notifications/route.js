import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import { EmergencyContact } from "@/models/EmergencyContact";
import sgMail from "@sendgrid/mail";
import twilio from "twilio";

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Initialize Twilio
const twilioClient =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { riskLevel, riskScore, concerns } = await request.json();

    await connectDB();

    // Get user and their emergency contacts
    const user = await User.findOne({ email: session.user.email }).populate("emergencyContacts");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const notificationsSent = [];
    const errors = [];

    // Filter contacts based on risk threshold
    const contactsToNotify = user.emergencyContacts.filter(
      (contact) => contact.alertThreshold <= riskScore && contact.isVerified
    );

    for (const contact of contactsToNotify) {
      try {
        // Prepare notification message
        const message = {
          subject: `Mental Health Alert for ${user.name}`,
          text: `
Dear ${contact.name},

${user.name} has shown signs of elevated risk in their mental health monitoring:

Risk Level: ${riskLevel}
Concerns: ${concerns.join(", ")}

Please reach out to them as soon as possible.

Contact Information:
Phone: ${user.phone || "Not provided"}
Email: ${user.email}

This is an automated message from Thryve Mental Health Platform.
          `.trim(),
        };

        // Send email notification
        if (contact.notificationMethods.includes("email") && process.env.SENDGRID_API_KEY) {
          await sgMail.send({
            to: contact.email,
            from: process.env.SENDGRID_FROM_EMAIL,
            ...message,
          });
          notificationsSent.push(`Email sent to ${contact.email}`);
        }

        // Send SMS notification
        if (contact.notificationMethods.includes("sms") && twilioClient && contact.phone) {
          await twilioClient.messages.create({
            body: message.text,
            to: contact.phone,
            from: process.env.TWILIO_PHONE_NUMBER,
          });
          notificationsSent.push(`SMS sent to ${contact.phone}`);
        }

        // Update last notified timestamp
        await EmergencyContact.findByIdAndUpdate(contact._id, {
          lastNotified: new Date(),
        });
      } catch (error) {
        console.error(`Error sending notification to ${contact.name}:`, error);
        errors.push(`Failed to notify ${contact.name}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      notificationsSent,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Notification error:", error);
    return NextResponse.json({ error: "Failed to send notifications" }, { status: 500 });
  }
}
