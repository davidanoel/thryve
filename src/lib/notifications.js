import { sendEmail } from "@/lib/email";
import { sendSMS } from "@/lib/twilio";

export async function sendEmergencyNotification(contact, user, riskAssessment) {
  try {
    // Generate content for both SMS and email
    const { smsContent, emailContent } = generateNotificationContent(riskAssessment, user);

    // Send notifications based on contact's notification preferences
    if (contact.notificationPreferences && contact.notificationPreferences.methods.length > 0) {
      // Send notifications in order of preference
      for (const method of contact.notificationPreferences.methods) {
        if (method === "sms" && contact.phone) {
          await sendSMS(contact.phone, smsContent);
        } else if (method === "email" && contact.email) {
          await sendEmail(contact.email, emailContent);
        }
      }
    } else {
      // If no preferences specified, try both methods if available
      if (contact.phone) {
        await sendSMS(contact.phone, smsContent);
      }
      if (contact.email) {
        await sendEmail(contact.email, emailContent);
      }
    }

    return true;
  } catch (error) {
    console.error("Error sending emergency notification:", error);
    return false;
  }
}

function generateNotificationContent(riskAssessment, user) {
  // Add default values and error handling
  if (!riskAssessment) {
    console.error("Risk assessment data is missing");
    return {
      smsContent:
        "🚨 EMERGENCY ALERT 🚨\n\nError: Risk assessment data is missing. Please contact emergency services immediately.",
      emailContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #dc2626; text-align: center;">🚨 Emergency Alert: Error</h1>
          <div style="background-color: #fef2f2; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <p style="color: #dc2626;">Error: Risk assessment data is missing.</p>
            <p>Please contact emergency services immediately.</p>
          </div>
        </div>
      `,
    };
  }

  const riskLevel = riskAssessment.riskLevel || "high";
  const score = riskAssessment.score || "N/A";
  const factors = riskAssessment.factors || [];

  // SMS Format - Concise and urgent
  const smsContent =
    `🚨 EMERGENCY ALERT 🚨\n\n` +
    `For: ${user.name.toUpperCase()}\n` +
    `Risk Level: ${riskLevel.toUpperCase()}\n` +
    `Score: ${score}\n\n` +
    `Key Factors:\n` +
    (factors.length > 0
      ? factors
          .slice(0, 2)
          .map((factor) => `• ${factor.name || "Unknown factor"}`)
          .join("\n")
      : "• No specific factors identified") +
    "\n\n" +
    (riskLevel === "critical"
      ? `⚠️ IMMEDIATE ACTION REQUIRED\n` +
        `1. Contact the individual NOW\n` +
        `2. Ensure they're not alone\n` +
        `3. Call emergency services if needed\n`
      : `⚠️ High Risk Alert\n` +
        `1. Contact as soon as possible\n` +
        `2. Offer support\n` +
        `3. Monitor closely\n`) +
    `\nCrisis Hotline: 988\n` +
    `Emergency: 911\n\n` +
    `From Thryve Mental Health App`;

  // Email Format - Detailed and formatted
  const emailContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #dc2626; text-align: center;">🚨 Emergency Alert: Mental Health Risk</h1>
      
      <div style="background-color: #fef2f2; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h2 style="color: #dc2626; margin-top: 0;">Risk Level: ${riskLevel.toUpperCase()}</h2>
        <p style="font-size: 18px; margin: 10px 0;">For: ${user.name.toUpperCase()}</p>
        <p style="font-size: 18px; margin: 10px 0;">Risk Score: ${score}</p>
      </div>

      <div style="background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #1e293b; margin-top: 0;">Key Risk Factors:</h3>
        <ul style="list-style-type: none; padding-left: 0;">
          ${
            factors.length > 0
              ? factors
                  .map(
                    (factor) => `
                <li style="margin: 10px 0; padding: 10px; background-color: white; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <strong>${factor.name || "Unknown factor"}</strong><br>
                  ${factor.description || "No description available"}
                </li>
              `
                  )
                  .join("")
              : `
              <li style="margin: 10px 0; padding: 10px; background-color: white; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                <strong>No specific factors identified</strong><br>
                Please proceed with caution and contact emergency services if needed.
              </li>
            `
          }
        </ul>
      </div>

      <div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #1e293b; margin-top: 0;">Recommended Actions:</h3>
        ${
          riskLevel === "critical"
            ? `
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li style="margin: 10px 0;"><strong>IMMEDIATELY</strong> contact the individual</li>
              <li style="margin: 10px 0;">Ensure they are not left alone</li>
              <li style="margin: 10px 0;">Contact emergency services if necessary</li>
            </ol>
          `
            : `
            <ol style="margin: 10px 0; padding-left: 20px;">
              <li style="margin: 10px 0;">Contact the individual as soon as possible</li>
              <li style="margin: 10px 0;">Offer support and assistance</li>
              <li style="margin: 10px 0;">Monitor their well-being closely</li>
            </ol>
          `
        }
      </div>

      <div style="background-color: #f1f5f9; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #1e293b; margin-top: 0;">Crisis Resources:</h3>
        <ul style="list-style-type: none; padding-left: 0;">
          <li style="margin: 10px 0;">📞 National Crisis Hotline: 988</li>
          <li style="margin: 10px 0;">🚑 Emergency Services: 911</li>
        </ul>
      </div>

      <div style="text-align: center; color: #64748b; font-size: 14px; margin-top: 30px;">
        <p>This is an automated alert from the Thryve mental health tracking app.</p>
      </div>
    </div>
  `;

  return { smsContent, emailContent };
}
