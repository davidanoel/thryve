"use client";

import {
  ChartBarIcon,
  ChatBubbleBottomCenterTextIcon,
  LightBulbIcon,
  HeartIcon,
  UserGroupIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

const iconComponents = {
  ChartBarIcon,
  ChatBubbleBottomCenterTextIcon,
  LightBulbIcon,
  HeartIcon,
  UserGroupIcon,
  SparklesIcon,
};

const features = [
  {
    name: "Mood Tracking",
    description:
      "Track your daily moods and emotions with our intuitive interface. Visualize patterns and trends over time through beautiful, interactive charts.",
    icon: "ChartBarIcon",
  },
  {
    name: "AI-Powered Insights",
    description:
      "Receive personalized insights and recommendations based on your mood patterns, activities, and behaviors.",
    icon: "LightBulbIcon",
  },
  {
    name: "Guided Exercises",
    description:
      "Access a library of meditation, breathing, and mindfulness exercises tailored to your current emotional state.",
    icon: "HeartIcon",
  },
  {
    name: "Journal Entries",
    description:
      "Document your thoughts and feelings with our journaling feature. AI analysis helps identify patterns and triggers.",
    icon: "ChatBubbleBottomCenterTextIcon",
  },
  {
    name: "Community Support",
    description:
      "Connect with others on similar wellness journeys through our moderated community forums.",
    icon: "UserGroupIcon",
  },
  {
    name: "Personalized Recommendations",
    description:
      "Get AI-curated activities, resources, and exercises based on your unique mental wellness profile.",
    icon: "SparklesIcon",
  },
];

export default function Features() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl mb-8">
            Powerful Features for Your <span className="text-indigo-600">Mental Wellness</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto">
            Discover the tools and features that make Thryve your perfect companion for mental
            health and emotional well-being.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => {
            const Icon = iconComponents[feature.icon];
            return (
              <div
                key={feature.name}
                className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-transform duration-300"
              >
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 mb-6 mx-auto">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 text-center mb-4">{feature.name}</h3>
                <p className="text-gray-500 text-center">{feature.description}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 bg-indigo-600 rounded-3xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Experience These Features?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join Thryve today and start your journey to better mental wellness.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/signup"
              className="inline-block bg-white text-indigo-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-indigo-50 transition-colors duration-300"
            >
              Get Started
            </Link>
            <Link
              href="/about"
              className="inline-block bg-indigo-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-indigo-400 transition-colors duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
