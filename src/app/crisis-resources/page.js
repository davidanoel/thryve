"use client";

import { useState, useEffect } from "react";
import { PhoneIcon, GlobeAltIcon } from "@heroicons/react/24/outline";

export default function CrisisResources() {
  const [crisisResources, setCrisisResources] = useState([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [resourceType, setResourceType] = useState("all");

  useEffect(() => {
    const getCrisisResources = async () => {
      try {
        setIsLoadingResources(true);
        const response = await fetch(
          `/api/crisis-resources${resourceType !== "all" ? `?type=${resourceType}` : ""}`
        );
        if (!response.ok) throw new Error("Failed to fetch crisis resources");
        const data = await response.json();

        // Ensure data is an array
        if (!Array.isArray(data)) {
          console.error("Invalid response format:", data);
          setCrisisResources([]);
          return;
        }

        setCrisisResources(data);
      } catch (error) {
        console.error("Error getting crisis resources:", error);
        setCrisisResources([]);
      } finally {
        setIsLoadingResources(false);
      }
    };

    getCrisisResources();
  }, [resourceType]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crisis Resources</h1>
          <p className="text-gray-600">Immediate help and support resources available 24/7</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex justify-center gap-2 mb-8">
          <button
            onClick={() => setResourceType("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              resourceType === "all"
                ? "bg-red-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            All Resources
          </button>
          <button
            onClick={() => setResourceType("emergency")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              resourceType === "emergency"
                ? "bg-red-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Emergency
          </button>
          <button
            onClick={() => setResourceType("professional")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              resourceType === "professional"
                ? "bg-red-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Professional Help
          </button>
          <button
            onClick={() => setResourceType("support")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              resourceType === "support"
                ? "bg-red-500 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            Support Groups
          </button>
        </div>

        {/* Resources Grid */}
        {isLoadingResources ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
          </div>
        ) : Array.isArray(crisisResources) && crisisResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crisisResources.map((resource) => (
              <div
                key={resource.name}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-lg text-gray-900">{resource.name}</h3>
                  {resource.type === "emergency" && (
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium">
                      Emergency
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
                <div className="space-y-3">
                  {resource.phone && (
                    <a
                      href={`tel:${resource.phone}`}
                      className="flex items-center gap-2 text-red-500 hover:text-red-600 font-medium"
                    >
                      <PhoneIcon className="h-5 w-5" />
                      {resource.phone}
                    </a>
                  )}
                  {resource.website && (
                    <a
                      href={resource.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-500 hover:text-blue-600 font-medium"
                    >
                      <GlobeAltIcon className="h-5 w-5" />
                      Visit Website
                    </a>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500">Available: {resource.availability}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No resources found.</p>
        )}

        {/* Emergency Notice */}
        <div className="mt-12 bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">If you're in immediate danger</h2>
          <p className="text-red-700 mb-4">
            Call emergency services (911) immediately or go to the nearest emergency room.
          </p>
          <a
            href="tel:911"
            className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-full font-medium hover:bg-red-600 transition-colors"
          >
            <PhoneIcon className="h-5 w-5" />
            Call 911
          </a>
        </div>
      </div>
    </div>
  );
}
