"use client";

import { useState, useEffect } from "react";
import {
  ChartBarIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  ClockIcon,
  BoltIcon,
  ChevronDownIcon,
  LinkIcon,
} from "@heroicons/react/24/outline";

export default function AIInsightsAndPredictions() {
  const [insights, setInsights] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeInsightTab, setActiveInsightTab] = useState("all");
  const [expandedSections, setExpandedSections] = useState({
    predictions: true,
    patterns: false,
    correlations: false,
    recommendations: false,
    trends: true,
    triggers: true,
    insightsRecommendations: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([getAIInsights(), getPredictions()]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      const response = await fetch("/api/ai/predictions");
      const data = await response.json();
      setPredictions(data.predictions);
    } catch (error) {
      console.error("Error getting predictions:", error);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (loading || isAnalyzing) {
    return (
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
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
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold flex items-center">
          <LightBulbIcon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 mr-2" />
          AI Insights & Predictions
        </h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveInsightTab("all")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              activeInsightTab === "all"
                ? "bg-indigo-100 text-indigo-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveInsightTab("insights")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              activeInsightTab === "insights"
                ? "bg-indigo-100 text-indigo-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Recent Insights
          </button>
          <button
            onClick={() => setActiveInsightTab("predictions")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              activeInsightTab === "predictions"
                ? "bg-indigo-100 text-indigo-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Long-term Predictions
          </button>
        </div>
      </div>

      {insights ? (
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
                      <h4 className="text-base font-medium text-gray-900">Trend Analysis</h4>
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
                      <h4 className="text-base font-medium text-gray-900">Identified Triggers</h4>
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
                                <h5 className="text-base font-medium text-gray-900">{rec.title}</h5>
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
                                    {rec.priority.charAt(0).toUpperCase() + rec.priority.slice(1)}{" "}
                                    Priority
                                  </span>
                                </div>
                              </div>
                              <p className="text-gray-600 whitespace-pre-wrap">{rec.description}</p>
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
          {(activeInsightTab === "all" || activeInsightTab === "predictions") && predictions && (
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

              {/* Future Predictions */}
              {predictions.predictions.length > 0 && (
                <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                  <button
                    onClick={() => toggleSection("predictions")}
                    className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <ChartBarIcon className="h-5 w-5 text-indigo-500 mr-2" />
                      <h4 className="text-base font-medium text-gray-900">Future Predictions</h4>
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

              {/* Long-term Patterns */}
              {predictions.patterns.length > 0 && (
                <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                  <button
                    onClick={() => toggleSection("patterns")}
                    className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <ChartBarIcon className="h-5 w-5 text-blue-500 mr-2" />
                      <h4 className="text-base font-medium text-gray-900">Long-term Patterns</h4>
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
                      <h4 className="text-base font-medium text-gray-900">Key Correlations</h4>
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
  );
}
