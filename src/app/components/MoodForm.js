"use client";

import { useState } from "react";
import {
  MoonIcon,
  BoltIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const moodOptions = [
  { value: "Very Happy", emoji: "😄", color: "bg-green-100 text-green-800" },
  { value: "Happy", emoji: "🙂", color: "bg-green-50 text-green-700" },
  { value: "Neutral", emoji: "😐", color: "bg-gray-100 text-gray-800" },
  { value: "Sad", emoji: "😔", color: "bg-blue-50 text-blue-700" },
  { value: "Very Sad", emoji: "😢", color: "bg-blue-100 text-blue-800" },
];

const activityOptions = [
  { name: "Exercise", icon: "🏃", description: "Physical activity" },
  { name: "Reading", icon: "📚", description: "Reading books or articles" },
  { name: "Meditation", icon: "🧘", description: "Mindfulness or meditation" },
  { name: "Social Activity", icon: "👥", description: "Time with others" },
  { name: "Work", icon: "💼", description: "Work or study" },
  { name: "Hobbies", icon: "🎨", description: "Creative activities" },
  { name: "Rest", icon: "😴", description: "Relaxation or rest" },
  { name: "Other", icon: "✨", description: "Other activities" },
];

const sliderLabels = {
  sleepQuality: {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent",
  },
  energyLevel: {
    1: "Exhausted",
    2: "Low",
    3: "Moderate",
    4: "High",
    5: "Very High",
  },
  socialInteractionCount: {
    0: "No interactions",
    2: "1-2 interactions",
    4: "3-4 interactions",
    6: "5-6 interactions",
    8: "7-8 interactions",
    10: "9+ interactions",
  },
  stressLevel: {
    1: "Very Low",
    2: "Low",
    3: "Moderate",
    4: "High",
    5: "Very High",
  },
};

export default function MoodForm({ onSubmit, isLoading }) {
  const [mood, setMood] = useState("");
  const [activities, setActivities] = useState([]);
  const [notes, setNotes] = useState("");
  const [sleepQuality, setSleepQuality] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [socialInteractionCount, setSocialInteractionCount] = useState(5);
  const [stressLevel, setStressLevel] = useState(3);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate that mood is selected
    if (!mood) {
      return;
    }

    const formattedActivities = activities.map((activity) => ({
      name: activity,
      duration: 30,
      isSocial: activity === "Social Activity",
    }));

    await onSubmit({
      mood,
      activities: formattedActivities,
      notes,
      sleepQuality,
      energyLevel,
      socialInteractionCount,
      stressLevel,
    });

    // Reset form
    setMood("");
    setActivities([]);
    setNotes("");
    setSleepQuality(3);
    setEnergyLevel(3);
    setSocialInteractionCount(5);
    setStressLevel(3);

    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getSliderLabel = (type, value) => {
    const labels = sliderLabels[type];
    const keys = Object.keys(labels).map(Number);
    const closest = keys.reduce((prev, curr) => {
      return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
    });
    return `${labels[closest]} (${value})`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">How are you feeling?</h2>
        <div className="flex items-center space-x-2">
          {showSuccess && (
            <div className="flex items-center text-green-600 text-sm">
              <CheckCircleIcon className="h-5 w-5 mr-1" />
              Saved!
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Quick Mood Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select your mood</label>
          <div className="grid grid-cols-5 gap-2">
            {moodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setMood(option.value)}
                className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                  mood === option.value
                    ? option.color
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                }`}
              >
                <span className="text-2xl mb-1">{option.emoji}</span>
                <span className="text-xs font-medium">{option.value}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Activities Grid */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What have you been doing?
          </label>
          <p className="text-sm text-gray-500 mb-3">Select activities that apply to your day</p>
          <div className="grid grid-cols-4 gap-2">
            {activityOptions.map((activity) => (
              <button
                key={activity.name}
                type="button"
                onClick={() => {
                  setActivities((prev) =>
                    prev.includes(activity.name)
                      ? prev.filter((a) => a !== activity.name)
                      : [...prev, activity.name]
                  );
                }}
                className={`flex flex-col items-center p-2 rounded-lg transition-all ${
                  activities.includes(activity.name)
                    ? "bg-indigo-50 text-indigo-700"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                }`}
              >
                <span className="text-xl mb-1">{activity.icon}</span>
                <span className="text-xs font-medium">{activity.name}</span>
                <span className="text-[10px] text-gray-500 mt-0.5">{activity.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Metrics Sliders */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">Rate your day</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sleep Quality</label>
              <div className="flex items-center space-x-2">
                <MoonIcon className="h-5 w-5 text-gray-400" />
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium text-indigo-600 min-w-[80px] text-right">
                  {getSliderLabel("sleepQuality", sleepQuality)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Energy Level</label>
              <div className="flex items-center space-x-2">
                <BoltIcon className="h-5 w-5 text-gray-400" />
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium text-indigo-600 min-w-[80px] text-right">
                  {getSliderLabel("energyLevel", energyLevel)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Social Interaction
              </label>
              <p className="text-xs text-gray-500 mb-2">
                Number of meaningful social interactions today (0-10)
              </p>
              <div className="flex items-center space-x-2">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={socialInteractionCount}
                  onChange={(e) => setSocialInteractionCount(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium text-indigo-600 min-w-[80px] text-right">
                  {getSliderLabel("socialInteractionCount", socialInteractionCount)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stress Level</label>
              <div className="flex items-center space-x-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-gray-400" />
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={stressLevel}
                  onChange={(e) => setStressLevel(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm font-medium text-indigo-600 min-w-[80px] text-right">
                  {getSliderLabel("stressLevel", stressLevel)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3 text-sm"
            rows="2"
            placeholder="How was your day? What's on your mind?"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !mood}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <ArrowPathIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
              Saving...
            </>
          ) : (
            "Save Entry"
          )}
        </button>
      </form>
    </div>
  );
}
