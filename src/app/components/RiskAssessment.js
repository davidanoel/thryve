"use client";

import { useState, useEffect } from "react";
import {
  ShieldExclamationIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChartBarIcon,
  LinkIcon
} from "@heroicons/react/24/outline";

export default function RiskAssessment() {
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    riskFactors: false,
    highRiskAlert: false,
  });

  useEffect(() => {
    getRiskAssessment();
  }, []);

  const getRiskAssessment = async () => {
    try {
      const response = await fetch("/api/risk/assessment");
      if (!response.ok) throw new Error("Failed to fetch risk assessment");
      const data = await response.json();
      setRiskAssessment(data.riskAssessment);
    } catch (error) {
      console.error("Error getting risk assessment:", error);
      setRiskAssessment(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg sm:text-xl font-semibold flex items-center">
          <ShieldExclamationIcon className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600 mr-2" />
          AI Risk Assessment
        </h2>
      </div>

      {loading ? (
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
                <div className="text-lg font-medium">{(riskAssessment.score || 0).toFixed(1)}</div>
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
                        <p className="text-sm text-gray-600 font-medium mb-1">Key Concerns:</p>
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
                                <span className="text-sm text-gray-600">{item.description}</span>
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
          {(riskAssessment.riskLevel === "high" || riskAssessment.riskLevel === "critical") && (
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
  );
}
