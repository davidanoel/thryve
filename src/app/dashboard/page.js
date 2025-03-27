"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  ChartBarIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import AdvancedAnalytics from "@/app/components/AdvancedAnalytics";
import MoodForm from "@/app/components/MoodForm";
import MoodHistoryChart from "@/app/components/MoodHistoryChart";
import GoalsAndProgress from "@/app/components/GoalsAndProgress";
import EmergencyContacts from "@/app/components/EmergencyContacts";
import AIInsightsAndPredictions from "@/app/components/AIInsightsAndPredictions";
import RiskAssessment from "@/app/components/RiskAssessment";

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const handleMoodSubmit = async (formData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/mood/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.ok) {
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
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Left Column */}
          <div className="space-y-4 sm:space-y-8">
            {/* Mood Entry Form */}
            <MoodForm onSubmit={handleMoodSubmit} isLoading={isLoading} />

            {/* Mood History Chart */}
            <MoodHistoryChart />

            {/* Goals & Progress */}
            <GoalsAndProgress />

            {/* Emergency Contacts */}
            <EmergencyContacts />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* AI Insights & Predictions */}
            <AIInsightsAndPredictions />

            {/* Advanced Analytics Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <ChartBarIcon className="h-6 w-6 text-blue-500" />
                  <h2 className="text-xl font-semibold">Advanced Analytics</h2>
                </div>
              </div>
              <AdvancedAnalytics />
            </div>

            {/* Risk Assessment */}
            <RiskAssessment />
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
    </div>
  );
}
