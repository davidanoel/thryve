import { NextResponse } from "next/server";

// Define crisis resources
const CRISIS_RESOURCES = [
  {
    name: "National Suicide Prevention Lifeline",
    type: "emergency",
    description: "24/7 free and confidential support for people in distress",
    phone: "1-800-273-8255",
    website: "https://suicidepreventionlifeline.org",
    availability: "24/7",
  },
  {
    name: "Crisis Text Line",
    type: "emergency",
    description: "Text HOME to connect with a Crisis Counselor",
    phone: "741741",
    website: "https://www.crisistextline.org",
    availability: "24/7",
  },
  {
    name: "SAMHSA's National Helpline",
    type: "professional",
    description:
      "Treatment referral and information service for individuals facing mental health disorders",
    phone: "1-800-662-4357",
    website: "https://www.samhsa.gov/find-help/national-helpline",
    availability: "24/7",
  },
  {
    name: "Psychology Today Therapist Finder",
    type: "professional",
    description: "Find detailed listings for mental health professionals in your area",
    website: "https://www.psychologytoday.com/us/therapists",
    availability: "Online directory",
  },
  {
    name: "7 Cups",
    type: "support",
    description:
      "Online emotional support through trained listeners and online therapy with licensed therapists",
    website: "https://www.7cups.com",
    availability: "24/7 online support",
  },
  {
    name: "NAMI HelpLine",
    type: "support",
    description:
      "Information, resource referrals and support for people living with mental health conditions",
    phone: "1-800-950-6264",
    website: "https://www.nami.org/help",
    availability: "Mon-Fri, 10 AM - 10 PM ET",
  },
];

export async function GET(request) {
  try {
    // Get the type query parameter
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    // If type is specified and valid, filter resources
    if (type && ["emergency", "professional", "support"].includes(type)) {
      const filteredResources = CRISIS_RESOURCES.filter((resource) => resource.type === type);
      return NextResponse.json(filteredResources);
    }

    // If no type specified or invalid type, return all resources
    return NextResponse.json(CRISIS_RESOURCES);
  } catch (error) {
    console.error("Error fetching crisis resources:", error);
    return NextResponse.json({ error: "Failed to fetch crisis resources" }, { status: 500 });
  }
}
