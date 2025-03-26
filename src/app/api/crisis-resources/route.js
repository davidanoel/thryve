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
    name: "Emergency Services",
    type: "emergency",
    description: "For immediate medical or police assistance",
    phone: "911",
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
    name: "SAMHSA Treatment Locator",
    type: "professional",
    description: "Find treatment facilities and programs in your area",
    website: "https://findtreatment.samhsa.gov",
    availability: "24/7",
  },
];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  let filteredResources = CRISIS_RESOURCES;

  if (type && type !== "all") {
    filteredResources = CRISIS_RESOURCES.filter((resource) => resource.type === type);
  }

  return NextResponse.json({ resources: filteredResources });
}
