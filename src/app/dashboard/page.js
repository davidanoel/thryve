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
  ArrowDownTrayIcon,
  LinkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

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
  const [activeGoalTab, setActiveGoalTab] = useState("active");
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState("overview");
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [showEmergencyContactForm, setShowEmergencyContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [isLoadingRisk, setIsLoadingRisk] = useState(false);
  const [activeInsightTab, setActiveInsightTab] = useState("all");
  const [expandedSections, setExpandedSections] = useState({
    predictions: true, // Future Predictions expanded by default
    patterns: false,
    correlations: false,
    recommendations: false,
    trends: true, // Recent Insights sections expanded by default
    triggers: true,
    insightsRecommendations: true,
    riskFactors: false,
    highRiskAlert: false,
    emergencyContacts: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Initial data load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchMoodHistory(),
          getGoals(),
          //getAIInsights(),
          //getPredictions(),
          getAdvancedMetrics(),
          getRiskAssessment(),
          getEmergencyContacts(),
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      setPredictions(data.predictions);
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
      setIsLoadingRisk(true);
      const response = await fetch("/api/risk/assessment");
      if (!response.ok) throw new Error("Failed to fetch risk assessment");
      const data = await response.json();
      setRiskAssessment(data.riskAssessment); // Update to access nested data
    } catch (error) {
      console.error("Error getting risk assessment:", error);
      setRiskAssessment(null);
    } finally {
      setIsLoadingRisk(false);
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

  const handleEditEmergencyContact = async (contactData) => {
    try {
      const response = await fetch(`/api/emergency-contacts?id=${editingContact._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactData),
      });

      if (!response.ok) throw new Error("Failed to update emergency contact");

      const data = await response.json();
      setEmergencyContacts((prev) =>
        prev.map((contact) => (contact._id === editingContact._id ? data.data : contact))
      );
      setShowEmergencyContactForm(false);
      setEditingContact(null);
    } catch (error) {
      console.error("Error updating emergency contact:", error);
      alert("Failed to update emergency contact. Please try again.");
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

  const handleExportData = async () => {
    try {
      // Create a temporary link element
      const link = document.createElement("a");
      link.href = "/api/export";
      link.download = `thryve-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Energy Level
                  </label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stress Level
                  </label>
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
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-3"
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
                                    style={{
                                      width: `${Math.min(100, Math.max(0, goal.progress))}%`,
                                    }}
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
                              {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}{" "}
                              Priority
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

            {/* Emergency Contacts Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <PhoneIcon className="h-6 w-6 text-red-500" />
                  Emergency Contacts
                </h2>
                <button
                  onClick={() => {
                    setEditingContact(null);
                    setShowEmergencyContactForm(true);
                  }}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PlusIcon className="h-5 w-5 mr-1" />
                  Add Contact
                </button>
              </div>

              {isLoadingContacts ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
                </div>
              ) : emergencyContacts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No emergency contacts added yet.</p>
              ) : (
                <div className="space-y-6">
                  {/* Summary Section - Always Visible */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full flex items-center justify-center bg-red-100">
                          <PhoneIcon className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Emergency Contacts</div>
                          <div className="text-lg font-medium">
                            {emergencyContacts.length} contacts
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Verified Contacts</div>
                        <div className="text-lg font-medium">
                          {emergencyContacts.filter((c) => c.isVerified).length}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contacts List - Collapsible */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection("emergencyContacts")}
                      className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <UserGroupIcon className="h-5 w-5 text-red-500 mr-2" />
                        <h4 className="text-base font-medium text-gray-900">Contact List</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-red-600 font-medium">
                          {emergencyContacts.length} contacts
                        </span>
                        <ChevronDownIcon
                          className={`h-5 w-5 text-gray-400 transform transition-transform ${
                            expandedSections.emergencyContacts ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>
                    {expandedSections.emergencyContacts && (
                      <div className="p-4 bg-gray-50 space-y-4">
                        {emergencyContacts.map((contact) => (
                          <div
                            key={contact._id}
                            className="bg-white rounded-xl p-4 transform transition-all hover:scale-[1.02] hover:shadow-md"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                                  {!contact.isVerified && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-50 text-yellow-600">
                                      Unverified
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{contact.relationship}</p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setEditingContact(contact);
                                    setShowEmergencyContactForm(true);
                                  }}
                                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDeleteEmergencyContact(contact._id)}
                                  className="text-gray-400 hover:text-red-600 transition-colors"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                            <div className="mt-3 space-y-2">
                              <div className="flex items-center text-sm text-gray-600">
                                <PhoneIcon className="h-4 w-4 mr-2" />
                                {contact.phone}
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <EnvelopeIcon className="h-4 w-4 mr-2" />
                                {contact.email}
                              </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <div>
                                  <span className="font-medium">Alert Threshold:</span>{" "}
                                  {contact.notificationPreferences.alertThreshold}
                                </div>
                                <div>
                                  <span className="font-medium">Notifications:</span>{" "}
                                  {contact.notificationPreferences.methods.join(", ")}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Emergency Contact Form Modal */}
            {showEmergencyContactForm && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-md w-full p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">
                      {editingContact ? "Edit Emergency Contact" : "Add Emergency Contact"}
                    </h3>
                    <button
                      onClick={() => {
                        setShowEmergencyContactForm(false);
                        setEditingContact(null);
                      }}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      const contactData = {
                        name: formData.get("name"),
                        relationship: formData.get("relationship"),
                        phone: formData.get("phone"),
                        email: formData.get("email"),
                        notificationPreferences: {
                          alertThreshold: formData.get("alertThreshold"),
                          methods: Array.from(formData.getAll("notificationMethods")),
                        },
                      };

                      if (editingContact) {
                        handleEditEmergencyContact(contactData);
                      } else {
                        handleAddEmergencyContact(contactData);
                      }
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
                        defaultValue={editingContact?.name}
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
                        defaultValue={editingContact?.relationship}
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
                        defaultValue={editingContact?.phone}
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
                        defaultValue={editingContact?.email}
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
                        defaultValue={
                          editingContact?.notificationPreferences?.alertThreshold || "critical"
                        }
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
                            defaultChecked={editingContact?.notificationPreferences?.methods?.includes(
                              "email"
                            )}
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
                            defaultChecked={editingContact?.notificationPreferences?.methods?.includes(
                              "sms"
                            )}
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
                        onClick={() => {
                          setShowEmergencyContactForm(false);
                          setEditingContact(null);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {editingContact ? "Update Contact" : "Add Contact"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* AI Insights Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <LightBulbIcon className="h-6 w-6 text-indigo-600 mr-2" />
                  AI Insights & Predictions
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveInsightTab("all")}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      activeInsightTab === "all"
                        ? "bg-indigo-100 text-indigo-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveInsightTab("insights")}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      activeInsightTab === "insights"
                        ? "bg-indigo-100 text-indigo-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Recent Insights
                  </button>
                  <button
                    onClick={() => setActiveInsightTab("predictions")}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      activeInsightTab === "predictions"
                        ? "bg-indigo-100 text-indigo-600"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Long-term Predictions
                  </button>
                </div>
              </div>

              {loading || isAnalyzing ? (
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
                  <p className="text-gray-600">Analyzing your patterns...</p>
                </div>
              ) : insights ? (
                <div className="space-y-8">
                  {/* Recent Insights Section (7 days) */}
                  {(activeInsightTab === "all" || activeInsightTab === "insights") && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center bg-indigo-50 px-4 py-2 rounded-lg">
                          <ClockIcon className="h-5 w-5 text-indigo-600 mr-2" />
                          Recent Insights (Last 7 Days)
                        </h3>
                        <span className="text-sm text-gray-500">
                          {new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString()} -{" "}
                          {new Date().toLocaleDateString()}
                        </span>
                      </div>

                      {/* Trends Section */}
                      {insights.trends.length > 0 && (
                        <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                          <button
                            onClick={() => toggleSection("trends")}
                            className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center">
                              <ArrowTrendingUpIcon className="h-5 w-5 text-blue-500 mr-2" />
                              <h4 className="text-base font-medium text-gray-900">
                                Trend Analysis
                              </h4>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-blue-600 font-medium">
                                {insights.trends.length} trends
                              </span>
                              <ChevronDownIcon
                                className={`h-5 w-5 text-gray-400 transform transition-transform ${
                                  expandedSections.trends ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                          </button>
                          {expandedSections.trends && (
                            <div className="p-4 bg-gray-50 space-y-4">
                              {insights.trends.map((trend, index) => (
                                <div
                                  key={index}
                                  className="bg-white rounded-xl p-4 transform transition-all hover:scale-[1.02] hover:shadow-md"
                                >
                                  <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                      <div className="p-2 bg-blue-50 rounded-lg">
                                        {trend.title.toLowerCase().includes("decline") ||
                                        trend.title.toLowerCase().includes("decrease") ||
                                        trend.title.toLowerCase().includes("worsen") ||
                                        trend.title.toLowerCase().includes("negative") ? (
                                          <ArrowTrendingDownIcon className="h-6 w-6 text-red-600" />
                                        ) : (
                                          <ArrowTrendingUpIcon className="h-6 w-6 text-blue-600" />
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-2">
                                        <h5 className="text-base font-medium text-gray-900">
                                          {trend.title}
                                        </h5>
                                        <div className="flex items-center space-x-2">
                                          {trend.timeframe && (
                                            <span className="text-sm font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                              {trend.timeframe}
                                            </span>
                                          )}
                                          <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-600">
                                            {trend.confidence}% Confidence
                                          </span>
                                        </div>
                                      </div>
                                      <p className="text-gray-600 whitespace-pre-wrap">
                                        {trend.description}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Triggers Section */}
                      {insights.triggers.length > 0 && (
                        <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                          <button
                            onClick={() => toggleSection("triggers")}
                            className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center">
                              <BoltIcon className="h-5 w-5 text-orange-500 mr-2" />
                              <h4 className="text-base font-medium text-gray-900">
                                Identified Triggers
                              </h4>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-orange-600 font-medium">
                                {insights.triggers.length} triggers
                              </span>
                              <ChevronDownIcon
                                className={`h-5 w-5 text-gray-400 transform transition-transform ${
                                  expandedSections.triggers ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                          </button>
                          {expandedSections.triggers && (
                            <div className="p-4 bg-gray-50 space-y-4">
                              {insights.triggers.map((trigger, index) => (
                                <div
                                  key={index}
                                  className="bg-white rounded-xl p-4 transform transition-all hover:scale-[1.02] hover:shadow-md"
                                >
                                  <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                      <div className="p-2 bg-orange-50 rounded-lg">
                                        <BoltIcon className="h-6 w-6 text-orange-600" />
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-2">
                                        <h5 className="text-base font-medium text-gray-900">
                                          {trigger.title}
                                        </h5>
                                        <div className="flex items-center space-x-2">
                                          <span className="text-sm font-medium px-3 py-1 rounded-full bg-orange-50 text-orange-600">
                                            {trigger.confidence}% Confidence
                                          </span>
                                          <span className="text-sm font-medium px-3 py-1 rounded-full bg-red-50 text-red-600">
                                            {trigger.impact} Impact
                                          </span>
                                        </div>
                                      </div>
                                      <p className="text-gray-600 whitespace-pre-wrap">
                                        {trigger.description}
                                      </p>
                                      {trigger.actionItems && trigger.actionItems.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                          <h6 className="text-sm font-medium text-gray-900 mb-2">
                                            Action Items:
                                          </h6>
                                          <ul className="space-y-2">
                                            {trigger.actionItems.map((item, idx) => (
                                              <li key={idx} className="flex items-start">
                                                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 text-sm font-medium mr-2">
                                                  {idx + 1}
                                                </span>
                                                <span className="text-sm text-gray-600">
                                                  {item.description}
                                                </span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Recommendations Section */}
                      {insights.recommendations.length > 0 && (
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => toggleSection("recommendations")}
                            className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center">
                              <SparklesIcon className="h-5 w-5 text-purple-500 mr-2" />
                              <h4 className="text-base font-medium text-gray-900">
                                Immediate Recommendations
                              </h4>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-purple-600 font-medium">
                                {insights.recommendations.length} recommendations
                              </span>
                              <ChevronDownIcon
                                className={`h-5 w-5 text-gray-400 transform transition-transform ${
                                  expandedSections.recommendations ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                          </button>
                          {expandedSections.recommendations && (
                            <div className="p-4 bg-gray-50 space-y-4">
                              {insights.recommendations.map((rec, index) => (
                                <div
                                  key={index}
                                  className="bg-white rounded-xl p-4 transform transition-all hover:scale-[1.02] hover:shadow-md"
                                >
                                  <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                      <div className="p-2 bg-purple-50 rounded-lg">
                                        <SparklesIcon className="h-6 w-6 text-purple-600" />
                                      </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between mb-2">
                                        <h5 className="text-base font-medium text-gray-900">
                                          {rec.title}
                                        </h5>
                                        <div className="flex items-center space-x-2">
                                          {rec.timeframe && (
                                            <span className="text-sm font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                              {rec.timeframe}
                                            </span>
                                          )}
                                          <span className="text-sm font-medium px-3 py-1 rounded-full bg-purple-50 text-purple-600">
                                            {rec.confidence}% Confidence
                                          </span>
                                          <span
                                            className={`text-sm font-medium px-3 py-1 rounded-full ${
                                              rec.priority === "high"
                                                ? "bg-red-50 text-red-600"
                                                : rec.priority === "medium"
                                                  ? "bg-yellow-50 text-yellow-600"
                                                  : "bg-green-50 text-green-600"
                                            }`}
                                          >
                                            {rec.priority.charAt(0).toUpperCase() +
                                              rec.priority.slice(1)}{" "}
                                            Priority
                                          </span>
                                        </div>
                                      </div>
                                      <p className="text-gray-600 whitespace-pre-wrap">
                                        {rec.description}
                                      </p>
                                      {rec.actionItems && rec.actionItems.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                          <h6 className="text-sm font-medium text-gray-900 mb-2">
                                            Action Steps:
                                          </h6>
                                          <ul className="space-y-2">
                                            {rec.actionItems.map((item, idx) => (
                                              <li key={idx} className="flex items-start">
                                                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 text-sm font-medium mr-2">
                                                  {idx + 1}
                                                </span>
                                                <span className="text-sm text-gray-600">
                                                  {item.description}
                                                </span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Long-term Predictions Section (30 days) */}
                  {(activeInsightTab === "all" || activeInsightTab === "predictions") &&
                    predictions && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center bg-indigo-50 px-4 py-2 rounded-lg">
                            <ChartBarIcon className="h-5 w-5 text-indigo-600 mr-2" />
                            Long-term Predictions (Last 30 Days)
                          </h3>
                          <span className="text-sm text-gray-500">
                            {new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString()} -{" "}
                            {new Date().toLocaleDateString()}
                          </span>
                        </div>

                        {/* Future Predictions - Collapsible but expanded by default */}
                        {predictions.predictions.length > 0 && (
                          <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                            <button
                              onClick={() => toggleSection("predictions")}
                              className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center">
                                <ChartBarIcon className="h-5 w-5 text-indigo-500 mr-2" />
                                <h4 className="text-base font-medium text-gray-900">
                                  Future Predictions
                                </h4>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-indigo-600 font-medium">
                                  {predictions.predictions.length} predictions
                                </span>
                                <ChevronDownIcon
                                  className={`h-5 w-5 text-gray-400 transform transition-transform ${
                                    expandedSections.predictions ? "rotate-180" : ""
                                  }`}
                                />
                              </div>
                            </button>
                            {expandedSections.predictions && (
                              <div className="p-4 bg-gray-50 space-y-4">
                                {predictions.predictions.map((pred, index) => (
                                  <div
                                    key={index}
                                    className="bg-white rounded-xl p-4 transform transition-all hover:scale-[1.02] hover:shadow-md"
                                  >
                                    <div className="flex items-start space-x-4">
                                      <div className="flex-shrink-0">
                                        <div className="p-2 bg-indigo-50 rounded-lg">
                                          <ChartBarIcon className="h-6 w-6 text-indigo-600" />
                                        </div>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                          <h5 className="text-base font-medium text-gray-900">
                                            {pred.title}
                                          </h5>
                                          <div className="flex items-center space-x-2">
                                            {pred.timeframe && (
                                              <span className="text-sm font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                                {pred.timeframe}
                                              </span>
                                            )}
                                            <span className="text-sm font-medium px-3 py-1 rounded-full bg-indigo-50 text-indigo-600">
                                              {pred.confidence}% Confidence
                                            </span>
                                          </div>
                                        </div>
                                        <p className="text-gray-600 whitespace-pre-wrap">
                                          {pred.description}
                                        </p>
                                        {pred.actionItems && pred.actionItems.length > 0 && (
                                          <div className="mt-4 pt-4 border-t border-gray-100">
                                            <h6 className="text-sm font-medium text-gray-900 mb-2">
                                              Action Steps:
                                            </h6>
                                            <ul className="space-y-2">
                                              {pred.actionItems.map((item, idx) => (
                                                <li key={idx} className="flex items-start">
                                                  <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-600 text-sm font-medium mr-2">
                                                    {idx + 1}
                                                  </span>
                                                  <span className="text-sm text-gray-600">
                                                    {item.description}
                                                  </span>
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Other Sections - Collapsible */}
                        <div className="space-y-4">
                          {/* Long-term Patterns */}
                          {predictions.patterns.length > 0 && (
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                              <button
                                onClick={() => toggleSection("patterns")}
                                className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center">
                                  <ChartBarIcon className="h-5 w-5 text-blue-500 mr-2" />
                                  <h4 className="text-base font-medium text-gray-900">
                                    Long-term Patterns
                                  </h4>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-blue-600 font-medium">
                                    {predictions.patterns.length} patterns
                                  </span>
                                  <ChevronDownIcon
                                    className={`h-5 w-5 text-gray-400 transform transition-transform ${
                                      expandedSections.patterns ? "rotate-180" : ""
                                    }`}
                                  />
                                </div>
                              </button>
                              {expandedSections.patterns && (
                                <div className="p-4 bg-gray-50 space-y-4">
                                  {predictions.patterns.map((pattern, index) => (
                                    <div
                                      key={index}
                                      className="bg-white rounded-xl p-4 transform transition-all hover:scale-[1.02] hover:shadow-md"
                                    >
                                      <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                          <div className="p-2 bg-blue-50 rounded-lg">
                                            <ChartBarIcon className="h-6 w-6 text-blue-600" />
                                          </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between mb-2">
                                            <h5 className="text-base font-medium text-gray-900">
                                              {pattern.title}
                                            </h5>
                                            <div className="flex items-center space-x-2">
                                              {pattern.timeframe && (
                                                <span className="text-sm font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                                  {pattern.timeframe}
                                                </span>
                                              )}
                                              <span className="text-sm font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-600">
                                                {pattern.confidence}% Confidence
                                              </span>
                                            </div>
                                          </div>
                                          <p className="text-gray-600">{pattern.description}</p>
                                          <div className="mt-2 flex items-center space-x-2">
                                            <span className="text-sm text-gray-500">Strength:</span>
                                            <span className="text-sm font-medium text-blue-600">
                                              {pattern.strength}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Key Correlations */}
                          {predictions.correlations.length > 0 && (
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                              <button
                                onClick={() => toggleSection("correlations")}
                                className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center">
                                  <LinkIcon className="h-5 w-5 text-green-500 mr-2" />
                                  <h4 className="text-base font-medium text-gray-900">
                                    Key Correlations
                                  </h4>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-green-600 font-medium">
                                    {predictions.correlations.length} correlations
                                  </span>
                                  <ChevronDownIcon
                                    className={`h-5 w-5 text-gray-400 transform transition-transform ${
                                      expandedSections.correlations ? "rotate-180" : ""
                                    }`}
                                  />
                                </div>
                              </button>
                              {expandedSections.correlations && (
                                <div className="p-4 bg-gray-50 space-y-4">
                                  {predictions.correlations.map((corr, index) => (
                                    <div
                                      key={index}
                                      className="bg-white rounded-xl p-4 transform transition-all hover:scale-[1.02] hover:shadow-md"
                                    >
                                      <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                          <div className="p-2 bg-green-50 rounded-lg">
                                            <LinkIcon className="h-6 w-6 text-green-600" />
                                          </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between mb-2">
                                            <h5 className="text-base font-medium text-gray-900">
                                              {corr.title}
                                            </h5>
                                            <div className="flex items-center space-x-2">
                                              {corr.timeframe && (
                                                <span className="text-sm font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                                  {corr.timeframe}
                                                </span>
                                              )}
                                              <span className="text-sm font-medium px-3 py-1 rounded-full bg-green-50 text-green-600">
                                                {corr.confidence}% Confidence
                                              </span>
                                            </div>
                                          </div>
                                          <p className="text-gray-600">{corr.description}</p>
                                          <div className="mt-2 flex items-center space-x-2">
                                            <span className="text-sm text-gray-500">Impact:</span>
                                            <span className="text-sm font-medium text-green-600">
                                              {corr.impact}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Strategic Recommendations */}
                          {predictions.recommendations.length > 0 && (
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                              <button
                                onClick={() => toggleSection("recommendations")}
                                className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center">
                                  <SparklesIcon className="h-5 w-5 text-purple-500 mr-2" />
                                  <h4 className="text-base font-medium text-gray-900">
                                    Strategic Recommendations
                                  </h4>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm text-purple-600 font-medium">
                                    {predictions.recommendations.length} recommendations
                                  </span>
                                  <ChevronDownIcon
                                    className={`h-5 w-5 text-gray-400 transform transition-transform ${
                                      expandedSections.recommendations ? "rotate-180" : ""
                                    }`}
                                  />
                                </div>
                              </button>
                              {expandedSections.recommendations && (
                                <div className="p-4 bg-gray-50 space-y-4">
                                  {predictions.recommendations.map((rec, index) => (
                                    <div
                                      key={index}
                                      className="bg-white rounded-xl p-4 transform transition-all hover:scale-[1.02] hover:shadow-md"
                                    >
                                      <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0">
                                          <div className="p-2 bg-purple-50 rounded-lg">
                                            <SparklesIcon className="h-6 w-6 text-purple-600" />
                                          </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between mb-2">
                                            <h5 className="text-base font-medium text-gray-900">
                                              {rec.title}
                                            </h5>
                                            <div className="flex items-center space-x-2">
                                              {rec.timeframe && (
                                                <span className="text-sm font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                                  {rec.timeframe}
                                                </span>
                                              )}
                                              <span className="text-sm font-medium px-3 py-1 rounded-full bg-purple-50 text-purple-600">
                                                {rec.confidence}% Confidence
                                              </span>
                                              <span
                                                className={`text-sm font-medium px-3 py-1 rounded-full ${
                                                  rec.priority === "high"
                                                    ? "bg-red-50 text-red-600"
                                                    : rec.priority === "medium"
                                                      ? "bg-yellow-50 text-yellow-600"
                                                      : "bg-green-50 text-green-600"
                                                }`}
                                              >
                                                {rec.priority.charAt(0).toUpperCase() +
                                                  rec.priority.slice(1)}{" "}
                                                Priority
                                              </span>
                                            </div>
                                          </div>
                                          <p className="text-gray-600 whitespace-pre-wrap">
                                            {rec.description}
                                          </p>
                                          {rec.actionItems && rec.actionItems.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-gray-100">
                                              <h6 className="text-sm font-medium text-gray-900 mb-2">
                                                Action Steps:
                                              </h6>
                                              <ul className="space-y-2">
                                                {rec.actionItems.map((item, idx) => (
                                                  <li key={idx} className="flex items-start">
                                                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-purple-100 text-purple-600 text-sm font-medium mr-2">
                                                      {idx + 1}
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                      {item.description}
                                                    </span>
                                                  </li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <LightBulbIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Add more mood entries to receive personalized insights and predictions.</p>
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
                                        return [
                                          "Very Sad",
                                          "Sad",
                                          "Neutral",
                                          "Happy",
                                          "Very Happy",
                                        ][value];
                                      },
                                    },
                                  },
                                },
                              }}
                            />
                          </div>
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white rounded-lg p-3 shadow-sm">
                              <div className="text-sm text-gray-500 mb-1">
                                Average Sleep Quality
                              </div>
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
                                    <span className="text-gray-600">
                                      {social.count} Interactions
                                    </span>
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <ShieldExclamationIcon className="h-6 w-6 text-indigo-600 mr-2" />
                  AI Risk Assessment
                </h2>
              </div>

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
                  {/* Risk Level Summary - Always Visible */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
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
                            {riskAssessment.riskLevel || "Not Assessed"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Risk Score</div>
                        <div className="text-lg font-medium">
                          {(riskAssessment.score || 0).toFixed(1)}
                        </div>
                        {riskAssessment.historicalComparison && (
                          <div className="text-sm text-gray-500 mt-1">
                            {riskAssessment.historicalComparison.change} from previous assessment
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Risk Factors Section - Collapsible */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection("riskFactors")}
                      className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 mr-2" />
                        <h4 className="text-base font-medium text-gray-900">Risk Factors</h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-orange-600 font-medium">
                          {(riskAssessment.factors || []).length} factors
                        </span>
                        <ChevronDownIcon
                          className={`h-5 w-5 text-gray-400 transform transition-transform ${
                            expandedSections.riskFactors ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>
                    {expandedSections.riskFactors && (
                      <div className="p-4 bg-gray-50 space-y-4">
                        {(riskAssessment.factors || []).map((factor, index) => (
                          <div key={index} className="bg-white rounded-xl p-4">
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
                                {(factor.score || 0).toFixed(1)}
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
                                style={{ width: `${factor.score || 0}%` }}
                              ></div>
                            </div>
                            {factor.description && (
                              <p className="text-sm text-gray-600 mt-2">{factor.description}</p>
                            )}
                            {factor.concerns && factor.concerns.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm text-gray-600 font-medium mb-1">
                                  Key Concerns:
                                </p>
                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                  {factor.concerns.map((concern, i) => (
                                    <li key={i}>{concern}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {factor.trend && (
                              <div className="mt-3 flex items-center space-x-2 text-sm">
                                <span className="text-gray-500">Trend:</span>
                                <span className="font-medium text-gray-700">{factor.trend}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Trends Section - Collapsible */}
                  {riskAssessment.trends && riskAssessment.trends.length > 0 && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleSection("trends")}
                        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center">
                          <ChartBarIcon className="h-5 w-5 text-blue-500 mr-2" />
                          <h4 className="text-base font-medium text-gray-900">Risk Trends</h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-blue-600 font-medium">
                            {riskAssessment.trends.length} trends
                          </span>
                          <ChevronDownIcon
                            className={`h-5 w-5 text-gray-400 transform transition-transform ${
                              expandedSections.trends ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </button>
                      {expandedSections.trends && (
                        <div className="p-4 bg-gray-50 space-y-4">
                          {riskAssessment.trends.map((trend, index) => (
                            <div key={index} className="bg-white rounded-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium">{trend.name}</span>
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      trend.direction === "increasing"
                                        ? "bg-red-100 text-red-600"
                                        : trend.direction === "decreasing"
                                          ? "bg-green-100 text-green-600"
                                          : "bg-blue-100 text-blue-600"
                                    }`}
                                  >
                                    {trend.direction}
                                  </span>
                                </div>
                                <span className="text-sm text-gray-500">{trend.timeframe}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <span>Strength:</span>
                                <span className="font-medium">{trend.strength}</span>
                                <span className="mx-2">•</span>
                                <span>Impact:</span>
                                <span className="font-medium">{trend.impact}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Early Warnings Section - Collapsible */}
                  {riskAssessment.earlyWarnings && riskAssessment.earlyWarnings.length > 0 && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleSection("earlyWarnings")}
                        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center">
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                          <h4 className="text-base font-medium text-gray-900">Early Warnings</h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-yellow-600 font-medium">
                            {riskAssessment.earlyWarnings.length} warnings
                          </span>
                          <ChevronDownIcon
                            className={`h-5 w-5 text-gray-400 transform transition-transform ${
                              expandedSections.earlyWarnings ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </button>
                      {expandedSections.earlyWarnings && (
                        <div className="p-4 bg-gray-50 space-y-4">
                          {riskAssessment.earlyWarnings.map((warning, index) => (
                            <div key={index} className="bg-white rounded-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium">{warning.type}</span>
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      warning.severity === "critical"
                                        ? "bg-red-100 text-red-600"
                                        : warning.severity === "high"
                                          ? "bg-orange-100 text-orange-600"
                                          : warning.severity === "medium"
                                            ? "bg-yellow-100 text-yellow-600"
                                            : "bg-blue-100 text-blue-600"
                                    }`}
                                  >
                                    {warning.severity}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600">{warning.description}</p>
                              {warning.actionItems && warning.actionItems.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-sm text-gray-600 font-medium mb-1">
                                    Recommended Actions:
                                  </p>
                                  <ul className="space-y-2">
                                    {warning.actionItems.map((item, idx) => (
                                      <li key={idx} className="flex items-start">
                                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-600 text-sm font-medium mr-2">
                                          {idx + 1}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                          {item.description}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Correlations Section - Collapsible */}
                  {riskAssessment.correlations && riskAssessment.correlations.length > 0 && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleSection("correlations")}
                        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center">
                          <LinkIcon className="h-5 w-5 text-green-500 mr-2" />
                          <h4 className="text-base font-medium text-gray-900">Key Correlations</h4>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-green-600 font-medium">
                            {riskAssessment.correlations.length} correlations
                          </span>
                          <ChevronDownIcon
                            className={`h-5 w-5 text-gray-400 transform transition-transform ${
                              expandedSections.correlations ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </button>
                      {expandedSections.correlations && (
                        <div className="p-4 bg-gray-50 space-y-4">
                          {riskAssessment.correlations.map((corr, index) => (
                            <div key={index} className="bg-white rounded-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium">
                                    {corr.factor1} ↔ {corr.factor2}
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      corr.strength === "strong"
                                        ? "bg-red-100 text-red-600"
                                        : corr.strength === "moderate"
                                          ? "bg-orange-100 text-orange-600"
                                          : "bg-green-100 text-green-600"
                                    }`}
                                  >
                                    {corr.strength}
                                  </span>
                                </div>
                                <span
                                  className={`text-sm font-medium ${
                                    corr.impact === "high"
                                      ? "text-red-600"
                                      : corr.impact === "moderate"
                                        ? "text-orange-600"
                                        : "text-green-600"
                                  }`}
                                >
                                  {corr.impact} Impact
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{corr.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* High Risk Alert Section - Collapsible */}
                  {(riskAssessment.riskLevel === "high" ||
                    riskAssessment.riskLevel === "critical") && (
                    <div className="border border-red-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleSection("highRiskAlert")}
                        className="w-full flex items-center justify-between p-4 bg-red-50 hover:bg-red-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                          <h4 className="text-base font-medium text-red-800">High Risk Alert</h4>
                        </div>
                        <ChevronDownIcon
                          className={`h-5 w-5 text-red-400 transform transition-transform ${
                            expandedSections.highRiskAlert ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {expandedSections.highRiskAlert && (
                        <div className="p-4 bg-red-50">
                          <div className="flex items-start">
                            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-red-800">
                                Immediate Action Required
                              </h3>
                              <div className="mt-2 text-sm text-red-700">
                                <p>
                                  Your current risk level is {riskAssessment.riskLevel}. We strongly
                                  recommend:
                                </p>
                                <ul className="list-disc list-inside mt-2 space-y-1">
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
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <ShieldExclamationIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No risk assessment data available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Add this button in the bottom-right corner of the dashboard */}
        <div className="flex justify-end mt-2">
          <button
            onClick={handleExportData}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />
            Export Data
          </button>
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
