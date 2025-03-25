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
  AcademicCapIcon,
  BeakerIcon,
  UserGroupIcon,
  MoonIcon,
  BoltIcon,
  UserIcon,
  ExclamationTriangleIcon,
  ChartPieIcon,
  ArrowPathIcon,
  ArrowTrendingDownIcon,
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

// Add slider labels
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
    0: "None",
    2: "Very Low",
    4: "Low",
    6: "Moderate",
    8: "High",
    10: "Very High",
  },
  stressLevel: {
    1: "Very Low",
    2: "Low",
    3: "Moderate",
    4: "High",
    5: "Very High",
  },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [mood, setMood] = useState("");
  const [activities, setActivities] = useState([]);
  const [notes, setNotes] = useState("");
  const [sleepQuality, setSleepQuality] = useState(3);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [socialInteractionCount, setSocialInteractionCount] = useState(5);
  const [stressLevel, setStressLevel] = useState(3);
  const [moodHistory, setMoodHistory] = useState([]);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [predictions, setPredictions] = useState(null);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);

  useEffect(() => {
    fetchMoodHistory();
    getPredictions();
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
      // Format activities properly
      const formattedActivities = activities.map((activity) => ({
        name: activity,
        duration: 30, // Default duration in minutes
        isSocial: activity === "Social Activity",
      }));

      const response = await fetch("/api/mood/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          mood,
          activities: formattedActivities,
          notes,
          sleepQuality,
          energyLevel,
          socialInteractionCount,
          stressLevel,
        }),
      });

      if (response.ok) {
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

        // Refresh data
        await fetchMoodHistory();

        // Get AI insights
        setIsAnalyzing(true);
        await getAIInsights();
        setIsAnalyzing(false);
      } else {
        const data = await response.json();
        console.error("Error submitting mood:", data.error);
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

  const getPredictions = async () => {
    try {
      setIsLoadingPredictions(true);
      const response = await fetch("/api/ai/predictions");
      const data = await response.json();
      setPredictions(data.analysis);
    } catch (error) {
      console.error("Error getting predictions:", error);
    } finally {
      setIsLoadingPredictions(false);
    }
  };

  // Add helper function to get slider label
  const getSliderLabel = (type, value) => {
    const labels = sliderLabels[type];
    const keys = Object.keys(labels).map(Number);
    const closest = keys.reduce((prev, curr) => {
      return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
    });
    return `${labels[closest]} (${value})`;
  };

  const chartData = {
    labels: moodHistory.map((entry) => new Date(entry.createdAt).toLocaleDateString()),
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sleep Quality
                </label>
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
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Energy Level</label>
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
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>Exhausted</span>
                  <span>Very High</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Social Interactions
                </label>
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
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>None</span>
                  <span>Very High</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stress Level</label>
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
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>Very Low</span>
                  <span>Very High</span>
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

        {/* Right Column - AI Insights and Predictions */}
        <div className="space-y-8">
          {/* AI Insights Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <LightBulbIcon className="h-6 w-6 text-indigo-600 mr-2" />
              AI Insights & Recommendations
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
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">{insight.title}</h3>
                            <span className="text-sm text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                              {insight.category}
                            </span>
                          </div>
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
                <p>Add more mood entries to receive personalized insights and recommendations.</p>
              </div>
            )}
          </div>

          {/* Predictive Analytics Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <ChartPieIcon className="h-6 w-6 text-indigo-600 mr-2" />
              Predictive Analytics
            </h2>

            {isLoadingPredictions ? (
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
                <p className="text-gray-600">Analyzing patterns and generating predictions...</p>
              </div>
            ) : predictions ? (
              <div className="space-y-6">
                {/* Patterns Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <ArrowPathIcon className="h-5 w-5 text-indigo-600 mr-2" />
                    Identified Patterns
                  </h3>
                  <div className="space-y-4">
                    {predictions.patterns.map((pattern, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                            {pattern.type}
                          </span>
                          <span className="text-sm text-gray-500">
                            Confidence: {pattern.confidence}
                          </span>
                        </div>
                        <p className="mt-2 text-gray-600">{pattern.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Predictions Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <ArrowTrendingUpIcon className="h-5 w-5 text-indigo-600 mr-2" />
                    Predictions
                  </h3>
                  <div className="space-y-4">
                    {predictions.predictions.map((prediction, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                            {prediction.factor}
                          </span>
                          <span className="text-sm text-gray-500">
                            Confidence: {prediction.confidence}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center">
                          {prediction.trend === "improving" ? (
                            <ArrowTrendingUpIcon className="h-5 w-5 text-green-500 mr-2" />
                          ) : prediction.trend === "declining" ? (
                            <ArrowTrendingDownIcon className="h-5 w-5 text-red-500 mr-2" />
                          ) : (
                            <ArrowPathIcon className="h-5 w-5 text-gray-500 mr-2" />
                          )}
                          <p className="text-gray-600">{prediction.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Correlations Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <BeakerIcon className="h-5 w-5 text-indigo-600 mr-2" />
                    Correlations
                  </h3>
                  <div className="space-y-4">
                    {predictions.correlations.map((correlation, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                            {correlation.factors.join(" ↔ ")}
                          </span>
                          <span className="text-sm text-gray-500">
                            Strength: {correlation.strength}
                          </span>
                        </div>
                        <p className="mt-2 text-gray-600">{correlation.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations Section */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <SparklesIcon className="h-5 w-5 text-indigo-600 mr-2" />
                    Personalized Recommendations
                  </h3>
                  <div className="space-y-4">
                    {predictions.recommendations.map((recommendation, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                            Priority: {recommendation.priority}
                          </span>
                        </div>
                        <h4 className="mt-2 font-medium text-gray-900">{recommendation.action}</h4>
                        <p className="mt-1 text-gray-600">{recommendation.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <ChartPieIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>
                  Add more mood entries to receive predictive analytics and pattern recognition.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
