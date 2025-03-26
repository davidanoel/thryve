import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(contact) {
  try {
    console.log("Attempting to send verification email to:", contact.email);
    const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?id=${contact._id}`;

    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: contact.email,
      subject: "Verify your emergency contact status",
      html: `
        <h2>Emergency Contact Verification</h2>
        <p>Hello ${contact.name},</p>
        <p>You have been added as an emergency contact. Please verify your status by clicking the link below and entering this code:</p>
        <h3 style="font-size: 24px; letter-spacing: 2px; background: #f0f0f0; padding: 10px; text-align: center;">${contact.verificationCode}</h3>
        <p>
          <a href="${verifyUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px;">
            Verify Your Status
          </a>
        </p>
        <p>Or visit this link: <a href="${verifyUrl}">${verifyUrl}</a></p>
        <p>This code will expire in 24 hours.</p>
        <p>Thank you for being there to support your loved one.</p>
      `,
    });
    console.log("Email sent successfully:", result);
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    console.error("Error details:", {
      to: contact.email,
      name: contact.name,
      code: contact.verificationCode,
      error: error.message,
    });
    return false;
  }
}

export async function sendEmergencyAlert({ user, contact, riskAssessment }) {
  try {
    console.log("Attempting to send emergency alert to:", contact.email);
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: contact.email,
      subject: "Emergency Alert - Support Needed",
      html: `
        <h2>Emergency Alert</h2>
        <p>Hello ${contact.name},</p>
        <p>This is an alert regarding ${user.name}. Our system has detected a ${riskAssessment.riskLevel} risk level that requires attention.</p>
        <h3>Risk Assessment Details:</h3>
        <ul>
          <li>Risk Level: ${riskAssessment.riskLevel}</li>
          <li>Overall Score: ${riskAssessment.score}</li>
        </ul>
        <p>Please reach out to ${user.name} as soon as possible.</p>
        <p>Contact Information:</p>
        <ul>
          <li>Email: ${user.email}</li>
        </ul>
      `,
    });
    console.log("Emergency alert sent successfully:", result);
    return true;
  } catch (error) {
    console.error("Error sending emergency alert:", error);
    console.error("Error details:", {
      to: contact.email,
      name: contact.name,
      user: user.name,
      error: error.message,
    });
    return false;
  }
}
