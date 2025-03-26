import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import User from "@/models/User";
import EmergencyContact from "@/models/EmergencyContact";
import CrisisPlan from "@/models/CrisisPlan";
import RiskAssessment from "@/models/RiskAssessment";
import connectDB from "@/lib/mongodb";

export async function GET(req) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Fetch all user data using Mongoose models
    const [user, emergencyContacts, crisisPlan, riskAssessments] = await Promise.all([
      User.findById(session.userId),
      EmergencyContact.find({ userId: session.userId }),
      CrisisPlan.findOne({ userId: session.userId }),
      RiskAssessment.find({ userId: session.userId }),
    ]);

    // Prepare export data
    const exportData = {
      user: {
        id: session.userId,
        email: user.email,
        name: user.name,
      },
      moodEntries: user.moodEntries,
      emergencyContacts,
      crisisPlan,
      riskAssessments,
      predictions: user.predictions,
      goals: user.goals,
      exportDate: new Date().toISOString(),
    };

    // Convert to JSON string
    const jsonString = JSON.stringify(exportData, null, 2);

    // Create response with appropriate headers for file download
    return new NextResponse(jsonString, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="thryve-data-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}
