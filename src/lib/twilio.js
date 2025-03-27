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
