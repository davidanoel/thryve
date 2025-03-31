"use client";

import { useState, useEffect } from "react";
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
import { ChartBarIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import Loader from "@/app/components/Loader";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const moodOptions = ["Very Happy", "Happy", "Neutral", "Sad", "Very Sad"];

export default function MoodHistoryChart() {
  const [moodHistory, setMoodHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("7d"); // 7d, 30d, 90d

  useEffect(() => {
    fetchMoodHistory();
  }, [timeRange]);

  const fetchMoodHistory = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/mood/history");
      if (!response.ok) throw new Error("Failed to fetch mood history");
      const data = await response.json();
      setMoodHistory(data.moodEntries);
    } catch (error) {
      console.error("Error fetching mood history:", error);
      setError("Failed to load mood history");
    } finally {
      setIsLoading(false);
    }
  };

  const getDateRange = () => {
    const now = new Date();
    const ranges = {
      "7d": new Date(now.setDate(now.getDate() - 7)),
      "30d": new Date(now.setDate(now.getDate() - 30)),
      "90d": new Date(now.setDate(now.getDate() - 90)),
    };
    return ranges[timeRange];
  };

  const filterMoodHistory = () => {
    const startDate = getDateRange();
    return moodHistory
      .filter((entry) => new Date(entry.createdAt) >= startDate)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  };

  const chartData = {
    labels: filterMoodHistory().map((entry) => {
      const date = new Date(entry.createdAt);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }),
    datasets: [
      {
        label: "Mood",
        data: filterMoodHistory().map((entry) => {
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
      tooltip: {
        callbacks: {
          label: function (context) {
            const value = context.raw;
            return moodOptions[4 - value];
          },
        },
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
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-900">Your Mood History</h2>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-sm rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={fetchMoodHistory}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            <ArrowPathIcon className={`h-5 w-5 text-gray-500 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error ? (
        <div className="text-red-600 text-sm">{error}</div>
      ) : isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader />
        </div>
      ) : moodHistory.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-500">
          No mood entries yet. Start by adding your first mood entry!
        </div>
      ) : (
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
}
