"use client";

import { useState, useEffect } from "react";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import Loader from "@/app/components/Loader";

export default function AdvancedAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    correlations: false,
    patterns: false,
    activityImpact: false,
    seasonalTrends: false,
  });

  useEffect(() => {
    const fetchAdvancedAnalytics = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/analytics");
        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }
        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdvancedAnalytics();
  }, []);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!analytics || analytics?.message) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{analytics?.message || "No analytics data available"}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overall Summary Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <button
          onClick={() => toggleSection("summary")}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Overall Summary</h3>
          </div>
          {expandedSections.summary ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {expandedSections.summary && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-gray-600">Trend:</span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  analytics.summary.overallTrend === "improving"
                    ? "bg-green-100 text-green-800"
                    : analytics.summary.overallTrend === "declining"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {analytics.summary.overallTrend.charAt(0).toUpperCase() +
                  analytics.summary.overallTrend.slice(1)}
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Key Findings:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {analytics.summary.keyFindings.map((finding, index) => (
                    <li key={index}>{finding}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  {analytics.summary.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Key Correlations Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <button
          onClick={() => toggleSection("correlations")}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ArrowPathIcon className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Key Correlations</h3>
          </div>
          {expandedSections.correlations ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {expandedSections.correlations && (
          <div className="px-4 pb-4">
            <div className="space-y-4">
              {analytics.correlations.map((correlation, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {correlation.factor1} ↔ {correlation.factor2}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        correlation.strength === "strong"
                          ? "bg-blue-100 text-blue-800"
                          : correlation.strength === "moderate"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {correlation.strength.charAt(0).toUpperCase() + correlation.strength.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{correlation.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Patterns Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <button
          onClick={() => toggleSection("patterns")}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ArrowTrendingUpIcon className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Patterns</h3>
          </div>
          {expandedSections.patterns ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {expandedSections.patterns && (
          <div className="px-4 pb-4">
            <div className="space-y-4">
              {analytics.patterns.map((pattern, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {pattern.type.charAt(0).toUpperCase() + pattern.type.slice(1)} Pattern
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        pattern.impact === "high"
                          ? "bg-red-100 text-red-800"
                          : pattern.impact === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                      }`}
                    >
                      {pattern.impact.charAt(0).toUpperCase() + pattern.impact.slice(1)} Impact
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{pattern.description}</p>
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Recommendations:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {pattern.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Activity Impact Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <button
          onClick={() => toggleSection("activityImpact")}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Activity Impact</h3>
          </div>
          {expandedSections.activityImpact ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {expandedSections.activityImpact && (
          <div className="px-4 pb-4">
            <div className="space-y-4">
              {analytics.activityImpact.map((activity, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{activity.activity}</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {activity.moodImpact.toFixed(1)} Impact
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(activity.moodImpact / 4) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">{activity.recommendation}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Seasonal Trends Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <button
          onClick={() => toggleSection("seasonalTrends")}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ArrowTrendingDownIcon className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900">Seasonal Trends</h3>
          </div>
          {expandedSections.seasonalTrends ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-500" />
          )}
        </button>
        {expandedSections.seasonalTrends && (
          <div className="px-4 pb-4">
            <div className="space-y-4">
              {analytics.seasonalTrends.map((trend, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {trend.period.charAt(0).toUpperCase() + trend.period.slice(1)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {trend.averageMood.toFixed(1)} Avg Mood
                      </span>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          trend.trend === "improving"
                            ? "bg-green-100 text-green-800"
                            : trend.trend === "declining"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {trend.trend.charAt(0).toUpperCase() + trend.trend.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Factors:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {trend.factors.map((factor, idx) => (
                        <li key={idx}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Suggestions:</h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {trend.suggestions.map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
