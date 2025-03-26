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
  ChartBarSquareIcon,
  ClockIcon,
  FireIcon,
  RectangleStackIcon,
  ShieldExclamationIcon,
  PlusIcon,
  XMarkIcon,
  PhoneIcon,
  EnvelopeIcon,
  TrashIcon,
  GlobeAltIcon,
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
  const [advancedMetrics, setAdvancedMetrics] = useState(null);
  const [isLoadingAdvancedMetrics, setIsLoadingAdvancedMetrics] = useState(false);
  const [goals, setGoals] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMoodForm, setShowMoodForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [activeTab, setActiveTab] = useState("patterns");
  const [activeGoalTab, setActiveGoalTab] = useState("active");
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState("overview");
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [showEmergencyContactForm, setShowEmergencyContactForm] = useState(false);
  const [isLoadingRisk, setIsLoadingRisk] = useState(false);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [crisisResources, setCrisisResources] = useState(null);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [resourceType, setResourceType] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchMoodHistory(),
          getGoals(),
          getPredictions(),
          getAdvancedMetrics(),
          getRiskAssessment(),
          getEmergencyContacts(),
          getCrisisResources(),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resourceType]);

  const fetchMoodHistory = async () => {
    try {
      const response = await fetch("/api/mood/history");
      const data = await response.json();
      setMoodHistory(data.moodEntries);
    } catch (error) {
      console.error("Error fetching mood history:", error);
    }
  };

  const getGoals = async () => {
    try {
      const response = await fetch("/api/goals");
      if (!response.ok) {
        throw new Error("Failed to fetch goals");
      }
      const data = await response.json();
      setGoals(data.goals || []);
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error("Error fetching goals:", error);
      setError("Failed to load goals");
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

  const getAdvancedMetrics = async () => {
    try {
      setIsLoadingAdvancedMetrics(true);
      const response = await fetch("/api/analytics/advanced");
      const data = await response.json();
      setAdvancedMetrics(data);
    } catch (error) {
      console.error("Error getting advanced metrics:", error);
    } finally {
      setIsLoadingAdvancedMetrics(false);
    }
  };

  const getRiskAssessment = async () => {
    try {
      const response = await fetch("/api/risk/assessment");
      if (!response.ok) throw new Error("Failed to fetch risk assessment");
      const data = await response.json();
      console.log("actual data", data);
      setRiskAssessment(data); // Update this line to use data directly instead of data.assessment
    } catch (error) {
      console.error("Error getting risk assessment:", error);
      setRiskAssessment(null);
    }
  };

  const getEmergencyContacts = async () => {
    try {
      setIsLoadingContacts(true);
      const response = await fetch("/api/emergency-contacts");
      const data = await response.json();
      setEmergencyContacts(data.contacts);
    } catch (error) {
      console.error("Error getting emergency contacts:", error);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const handleAddEmergencyContact = async (contactData) => {
    try {
      const response = await fetch("/api/emergency-contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactData),
      });

      if (response.ok) {
        const data = await response.json();
        setEmergencyContacts([...emergencyContacts, data.contact]);
        setShowEmergencyContactForm(false);
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error("Error adding emergency contact:", error);
    }
  };

  const handleDeleteEmergencyContact = async (contactId) => {
    try {
      const response = await fetch(`/api/emergency-contacts?id=${contactId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setEmergencyContacts(emergencyContacts.filter((c) => c._id !== contactId));
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error("Error deleting emergency contact:", error);
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

  const handleGoalSubmit = (newGoal) => {
    setGoals([...goals, newGoal]);
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      const response = await fetch(`/api/goals?goalId=${goalId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete goal");
      }

      setGoals(goals.filter((goal) => goal._id !== goalId));
    } catch (error) {
      console.error("Error deleting goal:", error);
      setError("Failed to delete goal");
    }
  };

  const getCrisisResources = async () => {
    try {
      setIsLoadingResources(true);
      const response = await fetch(
        `/api/crisis-resources${resourceType !== "all" ? `?type=${resourceType}` : ""}`
      );
      if (!response.ok) throw new Error("Failed to fetch crisis resources");
      const data = await response.json();
      setCrisisResources(data);
    } catch (error) {
      console.error("Error fetching crisis resources:", error);
    } finally {
      setIsLoadingResources(false);
    }
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

          {/* Goals & Recommendations - Moved here */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <AcademicCapIcon className="h-6 w-6 text-indigo-600 mr-2" />
                Goals & Recommendations
              </h2>
              <button
                onClick={() => setShowGoalForm(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add Goal
              </button>
            </div>

            {/* Tabs Navigation */}
            <div className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-6">
              <button
                onClick={() => setActiveGoalTab("active")}
                className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium flex-1 ${
                  activeGoalTab === "active"
                    ? "bg-white text-indigo-600 shadow"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <FireIcon className="h-5 w-5" />
                <span>Active Goals</span>
              </button>
              <button
                onClick={() => setActiveGoalTab("completed")}
                className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium flex-1 ${
                  activeGoalTab === "completed"
                    ? "bg-white text-indigo-600 shadow"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <CheckCircleIcon className="h-5 w-5" />
                <span>Completed</span>
              </button>
              <button
                onClick={() => setActiveGoalTab("recommendations")}
                className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium flex-1 ${
                  activeGoalTab === "recommendations"
                    ? "bg-white text-indigo-600 shadow"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                <SparklesIcon className="h-5 w-5" />
                <span>Recommendations</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="mt-4">
              {/* Active Goals Tab */}
              {activeGoalTab === "active" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {goals
                      .filter((goal) => goal.status !== "completed")
                      .map((goal) => (
                        <div
                          key={goal._id}
                          className="bg-gray-50 rounded-xl p-4 transform transition-all hover:scale-[1.02]"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center space-x-2">
                              <span
                                className={`text-sm font-medium px-3 py-1 rounded-full ${
                                  goal.type === "mood"
                                    ? "bg-purple-50 text-purple-600"
                                    : goal.type === "sleep"
                                    ? "bg-blue-50 text-blue-600"
                                    : goal.type === "activity"
                                    ? "bg-green-50 text-green-600"
                                    : "bg-orange-50 text-orange-600"
                                }`}
                              >
                                {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)}
                              </span>
                            </div>
                            <button
                              onClick={() => handleDeleteGoal(goal._id)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">{goal.title}</h3>
                          <p className="text-gray-600 mb-4">{goal.description}</p>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Target: {goal.target}</span>
                              {goal.deadline && (
                                <span className="text-gray-500">
                                  Due: {new Date(goal.deadline).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500">Progress</span>
                                <span className="font-medium text-indigo-600">
                                  {Math.round(goal.progress)}%
                                </span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(100, Math.max(0, goal.progress))}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  {goals.filter((goal) => goal.status !== "completed").length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <AcademicCapIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No active goals. Create a new goal to start tracking your progress!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Completed Goals Tab */}
              {activeGoalTab === "completed" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {goals
                      .filter((goal) => goal.status === "completed")
                      .map((goal) => (
                        <div
                          key={goal._id}
                          className="bg-gray-50 rounded-xl p-4 transform transition-all hover:scale-[1.02]"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium px-3 py-1 rounded-full bg-green-50 text-green-600">
                                Completed
                              </span>
                              <span
                                className={`text-sm font-medium px-3 py-1 rounded-full ${
                                  goal.type === "mood"
                                    ? "bg-purple-50 text-purple-600"
                                    : goal.type === "sleep"
                                    ? "bg-blue-50 text-blue-600"
                                    : goal.type === "activity"
                                    ? "bg-green-50 text-green-600"
                                    : "bg-orange-50 text-orange-600"
                                }`}
                              >
                                {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)}
                              </span>
                            </div>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">{goal.title}</h3>
                          <p className="text-gray-600 mb-4">{goal.description}</p>
                          <div className="text-sm text-gray-500">
                            Completed on: {new Date(goal.completedAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                  </div>
                  {goals.filter((goal) => goal.status === "completed").length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <CheckCircleIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No completed goals yet. Keep working towards your active goals!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Recommendations Tab */}
              {activeGoalTab === "recommendations" && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-xl p-4 transform transition-all hover:scale-[1.02]"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className={`text-sm font-medium px-3 py-1 rounded-full ${
                              rec.priority === "high"
                                ? "bg-red-50 text-red-600"
                                : rec.priority === "medium"
                                ? "bg-yellow-50 text-yellow-600"
                                : "bg-green-50 text-green-600"
                            }`}
                          >
                            {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)} Priority
                          </span>
                          <span className="text-sm font-medium px-3 py-1 rounded-full bg-indigo-50 text-indigo-600">
                            {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-600">{rec.message}</p>
                      </div>
                    ))}
                  </div>
                  {recommendations.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      <SparklesIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>
                        No recommendations available. Keep tracking your mood and working on your
                        goals!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
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
              <SparklesIcon className="h-6 w-6 text-indigo-600 mr-2" />
              AI Predictive Analytics
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
                <p className="text-gray-600">AI is analyzing your patterns...</p>
              </div>
            ) : predictions ? (
              <div>
                {/* Tabs Navigation */}
                <div className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-6">
                  <button
                    onClick={() => setActiveTab("forecast")}
                    className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium flex-1 ${
                      activeTab === "forecast"
                        ? "bg-white text-indigo-600 shadow"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <ArrowTrendingUpIcon className="h-5 w-5" />
                    <span>Mood Forecast</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("patterns")}
                    className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium flex-1 ${
                      activeTab === "patterns"
                        ? "bg-white text-indigo-600 shadow"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <ArrowPathIcon className="h-5 w-5" />
                    <span>Hidden Patterns</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("correlations")}
                    className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium flex-1 ${
                      activeTab === "correlations"
                        ? "bg-white text-indigo-600 shadow"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <ChartBarIcon className="h-5 w-5" />
                    <span>Correlations</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("insights")}
                    className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium flex-1 ${
                      activeTab === "insights"
                        ? "bg-white text-indigo-600 shadow"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <LightBulbIcon className="h-5 w-5" />
                    <span>AI Insights</span>
                  </button>
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                  {/* Mood Forecast Tab */}
                  {activeTab === "forecast" && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-1 gap-4">
                        {predictions.predictions.map((prediction, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-xl p-4 transform transition-all hover:scale-[1.02]"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                {prediction.trend === "improving" ? (
                                  <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />
                                ) : prediction.trend === "declining" ? (
                                  <ArrowTrendingDownIcon className="h-5 w-5 text-red-500" />
                                ) : (
                                  <ArrowPathIcon className="h-5 w-5 text-yellow-500" />
                                )}
                                <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                                  {prediction.factor}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <span className="text-sm text-gray-500 mr-2">Confidence</span>
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-indigo-600 h-2 rounded-full"
                                    style={{
                                      width: `${parseInt(prediction.confidence)}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-600">{prediction.explanation}</p>
                            {prediction.actionItems && (
                              <div className="mt-3 text-sm text-indigo-600">
                                Suggested Action: {prediction.actionItems}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hidden Patterns Tab */}
                  {activeTab === "patterns" && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-1 gap-4">
                        {predictions.patterns.map((pattern, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-xl p-4 transform transition-all hover:scale-[1.02]"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                                {pattern.type}
                              </span>
                              <div className="flex items-center">
                                <span className="text-sm text-gray-500 mr-2">Pattern Strength</span>
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-indigo-600 h-2 rounded-full"
                                    style={{
                                      width: `${parseInt(pattern.confidence)}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-600">{pattern.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Correlations Tab */}
                  {activeTab === "correlations" && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-1 gap-4">
                        {predictions.correlations.map((correlation, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-xl p-4 transform transition-all hover:scale-[1.02]"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                                  {correlation.factors.join(" & ")}
                                </span>
                                <span
                                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                                    correlation.strength === "strong"
                                      ? "bg-green-50 text-green-600"
                                      : correlation.strength === "moderate"
                                      ? "bg-yellow-50 text-yellow-600"
                                      : "bg-red-50 text-red-600"
                                  }`}
                                >
                                  {correlation.strength.charAt(0).toUpperCase() +
                                    correlation.strength.slice(1)}{" "}
                                  Correlation
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-600">{correlation.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Insights Tab */}
                  {activeTab === "insights" && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-1 gap-4">
                        {predictions.recommendations.map((recommendation, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-xl p-4 transform transition-all hover:scale-[1.02]"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span
                                className={`text-sm font-medium px-3 py-1 rounded-full ${
                                  recommendation.priority === "high"
                                    ? "bg-red-50 text-red-600"
                                    : recommendation.priority === "medium"
                                    ? "bg-yellow-50 text-yellow-600"
                                    : "bg-green-50 text-green-600"
                                }`}
                              >
                                {recommendation.priority.charAt(0).toUpperCase() +
                                  recommendation.priority.slice(1)}{" "}
                                Priority
                              </span>
                            </div>
                            <h4 className="font-medium text-gray-900 mb-2">
                              {recommendation.action}
                            </h4>
                            <p className="text-gray-600">{recommendation.impact}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <SparklesIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Add more mood entries to receive AI-powered predictions and insights.</p>
              </div>
            )}
          </div>

          {/* Advanced Analytics Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <ChartBarSquareIcon className="h-6 w-6 text-indigo-600 mr-2" />
                Advanced Analytics
              </h2>
            </div>

            {isLoadingAdvancedMetrics ? (
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
                <p className="text-gray-600">Analyzing your mood data...</p>
              </div>
            ) : advancedMetrics ? (
              <div>
                {/* Tabs Navigation */}
                <div className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-6">
                  <button
                    onClick={() => setActiveAnalyticsTab("overview")}
                    className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium flex-1 ${
                      activeAnalyticsTab === "overview"
                        ? "bg-white text-indigo-600 shadow"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <ChartPieIcon className="h-5 w-5" />
                    <span>Overview</span>
                  </button>
                  <button
                    onClick={() => setActiveAnalyticsTab("trends")}
                    className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium flex-1 ${
                      activeAnalyticsTab === "trends"
                        ? "bg-white text-indigo-600 shadow"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <ClockIcon className="h-5 w-5" />
                    <span>Weekly Trends</span>
                  </button>
                  <button
                    onClick={() => setActiveAnalyticsTab("activities")}
                    className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium flex-1 ${
                      activeAnalyticsTab === "activities"
                        ? "bg-white text-indigo-600 shadow"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <RectangleStackIcon className="h-5 w-5" />
                    <span>Activities</span>
                  </button>
                  <button
                    onClick={() => setActiveAnalyticsTab("sleep")}
                    className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium flex-1 ${
                      activeAnalyticsTab === "sleep"
                        ? "bg-white text-indigo-600 shadow"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <MoonIcon className="h-5 w-5" />
                    <span>Sleep & Stress</span>
                  </button>
                  <button
                    onClick={() => setActiveAnalyticsTab("social")}
                    className={`flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium flex-1 ${
                      activeAnalyticsTab === "social"
                        ? "bg-white text-indigo-600 shadow"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <UserGroupIcon className="h-5 w-5" />
                    <span>Social</span>
                  </button>
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                  {/* Overview Tab */}
                  {activeAnalyticsTab === "overview" && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="text-sm text-gray-500 mb-1">Total Entries</div>
                          <div className="text-2xl font-semibold text-indigo-600">
                            {advancedMetrics.metrics.totalEntries}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="text-sm text-gray-500 mb-1">Average Mood</div>
                          <div className="text-2xl font-semibold text-indigo-600">
                            {advancedMetrics.metrics.averageMood.toFixed(1)}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="text-sm text-gray-500 mb-1">Mood Volatility</div>
                          <div className="text-2xl font-semibold text-indigo-600">
                            {advancedMetrics.metrics.moodVolatility.toFixed(1)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Weekly Trends Tab */}
                  {activeAnalyticsTab === "trends" && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-4">
                          Weekly Mood Trends
                        </h4>
                        <div className="h-64">
                          <Line
                            data={{
                              labels: advancedMetrics.metrics.weeklyTrends.map((week) => {
                                const date = new Date(week.week);
                                return `${date.getMonth() + 1}/${date.getDate()}`;
                              }),
                              datasets: [
                                {
                                  label: "Average Mood",
                                  data: advancedMetrics.metrics.weeklyTrends.map(
                                    (week) => week.averageMood
                                  ),
                                  borderColor: "rgb(99, 102, 241)",
                                  backgroundColor: "rgba(99, 102, 241, 0.1)",
                                  tension: 0.4,
                                  fill: true,
                                },
                              ],
                            }}
                            options={{
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
                                      return ["Very Sad", "Sad", "Neutral", "Happy", "Very Happy"][
                                        value
                                      ];
                                    },
                                  },
                                },
                              },
                            }}
                          />
                        </div>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <div className="text-sm text-gray-500 mb-1">Average Sleep Quality</div>
                            <div className="text-lg font-medium text-indigo-600">
                              {advancedMetrics.metrics.weeklyTrends[
                                advancedMetrics.metrics.weeklyTrends.length - 1
                              ]?.averageSleepQuality.toFixed(1)}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <div className="text-sm text-gray-500 mb-1">Average Energy Level</div>
                            <div className="text-lg font-medium text-indigo-600">
                              {advancedMetrics.metrics.weeklyTrends[
                                advancedMetrics.metrics.weeklyTrends.length - 1
                              ]?.averageEnergyLevel.toFixed(1)}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-3 shadow-sm">
                            <div className="text-sm text-gray-500 mb-1">Average Stress Level</div>
                            <div className="text-lg font-medium text-indigo-600">
                              {advancedMetrics.metrics.weeklyTrends[
                                advancedMetrics.metrics.weeklyTrends.length - 1
                              ]?.averageStressLevel.toFixed(1)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Activities Tab */}
                  {activeAnalyticsTab === "activities" && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="space-y-4">
                          {advancedMetrics.metrics.activityCorrelations
                            .sort((a, b) => b.averageMood - a.averageMood)
                            .map((activity, index) => (
                              <div key={index}>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm font-medium text-gray-900">
                                    {activity.activity}
                                  </span>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500">Impact Score:</span>
                                    <span className="text-sm font-medium text-indigo-600">
                                      {activity.averageMood.toFixed(1)}
                                    </span>
                                  </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${(activity.averageMood / 4) * 100}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Frequency: {activity.frequency} times
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sleep & Stress Tab */}
                  {activeAnalyticsTab === "sleep" && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">
                            Sleep Quality Impact
                          </h4>
                          <div className="space-y-3">
                            {advancedMetrics.metrics.sleepImpact
                              .sort((a, b) => b.averageMood - a.averageMood)
                              .map((sleep, index) => (
                                <div key={index} className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                      Quality Level {sleep.quality}
                                    </span>
                                    <span className="text-indigo-600">
                                      {sleep.averageMood.toFixed(1)}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${(sleep.averageMood / 4) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">
                            Stress Level Impact
                          </h4>
                          <div className="space-y-3">
                            {advancedMetrics.metrics.stressImpact
                              .sort((a, b) => a.averageMood - b.averageMood)
                              .map((stress, index) => (
                                <div key={index} className="space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Level {stress.level}</span>
                                    <span className="text-indigo-600">
                                      {stress.averageMood.toFixed(1)}
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${(stress.averageMood / 4) * 100}%` }}
                                    ></div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Social Tab */}
                  {activeAnalyticsTab === "social" && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="space-y-3">
                          {advancedMetrics.metrics.socialImpact
                            .sort((a, b) => b.averageMood - a.averageMood)
                            .map((social, index) => (
                              <div key={index} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">{social.count} Interactions</span>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-gray-500">Mood Impact:</span>
                                    <span className="text-indigo-600">
                                      {social.averageMood.toFixed(1)}
                                    </span>
                                  </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${(social.averageMood / 4) * 100}%` }}
                                  ></div>
                                </div>
                                <div className="text-xs text-gray-500">
                                  Frequency: {social.frequency} times
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <ChartBarSquareIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Add more mood entries to see advanced analytics and insights.</p>
              </div>
            )}
          </div>

          {/* Risk Assessment Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <ShieldExclamationIcon className="h-6 w-6 text-indigo-600 mr-2" />
              Risk Assessment
            </h2>

            {isLoadingRisk ? (
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
                <p className="text-gray-600">Analyzing risk factors...</p>
              </div>
            ) : riskAssessment ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center ${
                        riskAssessment.riskLevel === "critical"
                          ? "bg-red-100"
                          : riskAssessment.riskLevel === "high"
                          ? "bg-orange-100"
                          : riskAssessment.riskLevel === "medium"
                          ? "bg-yellow-100"
                          : "bg-green-100"
                      }`}
                    >
                      <ShieldExclamationIcon
                        className={`h-6 w-6 ${
                          riskAssessment.riskLevel === "critical"
                            ? "text-red-600"
                            : riskAssessment.riskLevel === "high"
                            ? "text-orange-600"
                            : riskAssessment.riskLevel === "medium"
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Current Risk Level</div>
                      <div className="text-lg font-medium capitalize">
                        {riskAssessment.riskLevel}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Risk Score</div>
                    <div className="text-lg font-medium">{riskAssessment.score.toFixed(1)}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {riskAssessment.factors.map((factor, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{factor.name}</span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              factor.type === "mood"
                                ? "bg-purple-100 text-purple-600"
                                : factor.type === "language"
                                ? "bg-blue-100 text-blue-600"
                                : factor.type === "sleep"
                                ? "bg-indigo-100 text-indigo-600"
                                : factor.type === "social"
                                ? "bg-green-100 text-green-600"
                                : "bg-orange-100 text-orange-600"
                            }`}
                          >
                            {factor.type}
                            {console.log(factor)}
                          </span>
                        </div>
                        <span
                          className={`text-sm font-medium ${
                            factor.score >= 75
                              ? "text-red-600"
                              : factor.score >= 50
                              ? "text-orange-600"
                              : factor.score >= 25
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {factor.score.toFixed(1)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            factor.score >= 75
                              ? "bg-red-600"
                              : factor.score >= 50
                              ? "bg-orange-600"
                              : factor.score >= 25
                              ? "bg-yellow-600"
                              : "bg-green-600"
                          }`}
                          style={{ width: `${factor.score}%` }}
                        ></div>
                      </div>
                      {factor.description && (
                        <p className="text-sm text-gray-600 mt-2">{factor.description}</p>
                      )}
                      {factor.concerns && factor.concerns.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600 font-medium mb-1">Key Concerns:</p>
                          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                            {factor.concerns.map((concern, i) => (
                              <li key={i}>{concern}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {(riskAssessment.riskLevel === "high" ||
                  riskAssessment.riskLevel === "critical") && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">High Risk Alert</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>
                            Your current risk level is {riskAssessment.riskLevel}. We strongly
                            recommend:
                          </p>
                          <ul className="list-disc list-inside mt-2">
                            <li>Reaching out to your emergency contacts</li>
                            <li>Contacting a mental health professional</li>
                            <li>Using available crisis resources</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <ShieldExclamationIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No risk assessment data available.</p>
              </div>
            )}
          </div>

          {/* Emergency Contacts Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center">
                <UserGroupIcon className="h-6 w-6 text-indigo-600 mr-2" />
                Emergency Contacts
              </h2>
              <button
                onClick={() => setShowEmergencyContactForm(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-5 w-5 mr-1" />
                Add Contact
              </button>
            </div>

            {isLoadingContacts ? (
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
                <p className="text-gray-600">Loading emergency contacts...</p>
              </div>
            ) : emergencyContacts.length > 0 ? (
              <div className="space-y-4">
                {emergencyContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="bg-gray-50 rounded-lg p-4 flex items-start justify-between"
                  >
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{contact.name}</h3>
                      <p className="text-sm text-gray-500">{contact.relationship}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600">
                          <PhoneIcon className="h-4 w-4 inline mr-1" />
                          {contact.phone}
                        </p>
                        <p className="text-sm text-gray-600">
                          <EnvelopeIcon className="h-4 w-4 inline mr-1" />
                          {contact.email}
                        </p>
                      </div>
                      {!contact.isVerified && (
                        <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending Verification
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteEmergencyContact(contact._id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <UserGroupIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No emergency contacts added yet.</p>
                <p className="mt-2 text-sm">
                  Add trusted contacts who can be notified in case of emergency.
                </p>
              </div>
            )}
          </div>

          {showEmergencyContactForm && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Add Emergency Contact</h3>
                  <button
                    onClick={() => setShowEmergencyContactForm(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    handleAddEmergencyContact({
                      name: formData.get("name"),
                      relationship: formData.get("relationship"),
                      phone: formData.get("phone"),
                      email: formData.get("email"),
                      notificationPreferences: {
                        alertThreshold: formData.get("alertThreshold"),
                        methods: Array.from(formData.getAll("notificationMethods")),
                      },
                    });
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="relationship"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Relationship
                    </label>
                    <input
                      type="text"
                      name="relationship"
                      id="relationship"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="alertThreshold"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Alert Threshold
                    </label>
                    <select
                      name="alertThreshold"
                      id="alertThreshold"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="critical">Critical Risk Only</option>
                      <option value="high">High Risk and Above</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Notification Methods
                    </label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="notificationMethods"
                          value="email"
                          defaultChecked
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="email" className="ml-2 text-sm text-gray-700">
                          Email
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="notificationMethods"
                          value="sms"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="sms" className="ml-2 text-sm text-gray-700">
                          SMS
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowEmergencyContactForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Add Contact
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Crisis Resources Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <PhoneIcon className="h-6 w-6 text-red-500" />
                Crisis Resources
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setResourceType("all")}
                  className={`px-3 py-1 rounded-full text-sm ${
                    resourceType === "all" ? "bg-red-500 text-white" : "bg-gray-100"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setResourceType("emergency")}
                  className={`px-3 py-1 rounded-full text-sm ${
                    resourceType === "emergency" ? "bg-red-500 text-white" : "bg-gray-100"
                  }`}
                >
                  Emergency
                </button>
                <button
                  onClick={() => setResourceType("professional")}
                  className={`px-3 py-1 rounded-full text-sm ${
                    resourceType === "professional" ? "bg-red-500 text-white" : "bg-gray-100"
                  }`}
                >
                  Professional
                </button>
                <button
                  onClick={() => setResourceType("support")}
                  className={`px-3 py-1 rounded-full text-sm ${
                    resourceType === "support" ? "bg-red-500 text-white" : "bg-gray-100"
                  }`}
                >
                  Support
                </button>
              </div>
            </div>

            {isLoadingResources ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {crisisResources?.map((resource) => (
                  <div
                    key={resource.name}
                    className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-lg">{resource.name}</h3>
                      {resource.type === "emergency" && (
                        <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                          Emergency
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mt-2">{resource.description}</p>
                    <div className="mt-4 space-y-2">
                      {resource.phone && (
                        <a
                          href={`tel:${resource.phone}`}
                          className="flex items-center gap-2 text-red-500 hover:text-red-600"
                        >
                          <PhoneIcon className="h-4 w-4" />
                          {resource.phone}
                        </a>
                      )}
                      {resource.website && (
                        <a
                          href={resource.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
                        >
                          <GlobeAltIcon className="h-4 w-4" />
                          Visit Website
                        </a>
                      )}
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      Available: {resource.availability}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showGoalForm && (
        <GoalForm onClose={() => setShowGoalForm(false)} onSubmit={handleGoalSubmit} />
      )}
    </div>
  );
}

const GoalForm = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "mood",
    target: "",
    deadline: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create goal");
      }

      const data = await response.json();
      onSubmit(data.goal);
      onClose();
    } catch (error) {
      console.error("Error creating goal:", error);
      setError("Failed to create goal");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Create New Goal</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows="3"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
              <option value="mood">Mood</option>
              <option value="sleep">Sleep</option>
              <option value="activity">Activity</option>
              <option value="social">Social</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Target Value
            </label>
            <input
              type="number"
              value={formData.target}
              onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              min="1"
              max="5"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">
              Deadline (Optional)
            </label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

<style jsx>{`
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-in-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`}</style>;
