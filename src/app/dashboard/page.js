"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  ChartBarIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  HeartIcon,
  SparklesIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const moodOptions = ["Very Happy", "Happy", "Neutral", "Sad", "Very Sad"];
const activityOptions = [
  "Exercise",
  "Reading",
  "Meditation",
  "Social Activity",
  "Work",
  "Hobbies",
  "Rest",
  "Other",
];

export default function Dashboard() {
  const { user } = useAuth();
  const [mood, setMood] = useState("");
  const [activities, setActivities] = useState([]);
  const [notes, setNotes] = useState("");
  const [moodHistory, setMoodHistory] = useState([]);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    fetchMoodHistory();
  }, []);

  const fetchMoodHistory = async () => {
    try {
      const response = await fetch("/api/mood/history");
      const data = await response.json();
      setMoodHistory(data.moodEntries);
    } catch (error) {
      console.error("Error fetching mood history:", error);
    }
  };

  const handleMoodSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/mood/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mood,
          activities,
          notes,
        }),
      });

      if (response.ok) {
        // Reset form
        setMood("");
        setActivities([]);
        setNotes("");

        // Show success message
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

        // Refresh mood history
        await fetchMoodHistory();

        // Get AI insights
        setIsAnalyzing(true);
        await getAIInsights();
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error("Error submitting mood:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAIInsights = async () => {
    try {
      const response = await fetch("/api/ai/insights");
      const data = await response.json();
      setInsights(data.insights);
    } catch (error) {
      console.error("Error getting AI insights:", error);
    }
  };

  const chartData = {
    labels: moodHistory.map((entry) => new Date(entry.date).toLocaleDateString()),
    datasets: [
      {
        label: "Mood",
        data: moodHistory.map((entry) => {
          const moodIndex = moodOptions.indexOf(entry.mood);
          return 4 - moodIndex; // Convert to numerical value (4 = Very Happy, 0 = Very Sad)
        }),
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 4,
        ticks: {
          stepSize: 1,
          callback: function (value) {
            return moodOptions[4 - value];
          },
        },
      },
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome back, {user?.name}!</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Mood Entry Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">How are you feeling today?</h2>
            <form onSubmit={handleMoodSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mood</label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select your mood</option>
                  {moodOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Activities</label>
                <div className="grid grid-cols-2 gap-2">
                  {activityOptions.map((activity) => (
                    <label key={activity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={activities.includes(activity)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setActivities([...activities, activity]);
                          } else {
                            setActivities(activities.filter((a) => a !== activity));
                          }
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{activity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows="3"
                  placeholder="How was your day? What's on your mind?"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  "Save Entry"
                )}
              </button>
            </form>

            {/* Success Message */}
            {showSuccess && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg flex items-center text-green-700">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Entry saved successfully!
              </div>
            )}
          </div>

          {/* Mood History Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Your Mood History</h2>
            <div className="h-64">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Right Column - AI Insights */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <LightBulbIcon className="h-6 w-6 text-indigo-600 mr-2" />
            AI Insights
          </h2>

          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg
                className="animate-spin h-10 w-10 text-indigo-600 mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-gray-600">Analyzing your mood patterns...</p>
            </div>
          ) : insights && insights.length > 0 ? (
            <div className="space-y-6">
              {insights.map((insight, index) => {
                const icons = {
                  trend: ArrowTrendingUpIcon,
                  activity: ChartBarIcon,
                  recommendation: SparklesIcon,
                  wellbeing: HeartIcon,
                };
                const Icon = icons[insight.type] || LightBulbIcon;

                return (
                  <div key={index} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <Icon className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">{insight.title}</h3>
                        <p className="mt-1 text-gray-600">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <LightBulbIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>
                No insights available yet. Add more mood entries to receive personalized analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
