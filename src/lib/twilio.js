import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function sendSMS(to, message) {
  try {
    console.log("Attempting to send SMS:", {
      to,
      message,
      accountSid: process.env.TWILIO_ACCOUNT_SID ? "Present" : "Missing",
      authToken: process.env.TWILIO_AUTH_TOKEN ? "Present" : "Missing",
      phoneNumber: process.env.TWILIO_PHONE_NUMBER ? "Present" : "Missing",
    });

    const result = await client.messages.create({
      body: message,
      to: to,
      from: process.env.TWILIO_PHONE_NUMBER,
    });
    console.log("SMS sent successfully:", result.sid);
    return result;
  } catch (error) {
    console.error("Error sending SMS:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
      status: error.status,
      moreInfo: error.moreInfo,
    });
    throw error;
  }
}

export async function sendEmergencySMS(contact, riskAssessment) {
  console.log("Preparing emergency SMS for contact:", {
    name: contact.name,
    phone: contact.phone,
    riskLevel: riskAssessment.riskLevel,
    score: riskAssessment.score,
  });

  const message = `EMERGENCY ALERT: ${riskAssessment.user.name} has been identified as having a ${riskAssessment.riskLevel} risk level. 
Risk Score: ${riskAssessment.score}
Key Concerns: ${riskAssessment.factors.map((f) => f.concerns.join(", ")).join("; ")}
Please check on them immediately.`;

  return sendSMS(contact.phone, message);
}
