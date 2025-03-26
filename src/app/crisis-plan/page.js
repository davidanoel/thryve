"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  ShieldCheckIcon,
  PhoneIcon,
  UserGroupIcon,
  MapPinIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

export default function CrisisPlan() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [crisisPlan, setCrisisPlan] = useState({
    emergencyContacts: [],
    warningSigns: [],
    copingStrategies: [],
    professionalHelp: [],
    safePlaces: [],
    personalStrengths: [],
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchCrisisPlan = async () => {
      try {
        const response = await fetch("/api/crisis-plan");
        if (!response.ok) throw new Error("Failed to fetch crisis plan");
        const data = await response.json();
        if (data) {
          setCrisisPlan(data);
        }
      } catch (error) {
        console.error("Error fetching crisis plan:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCrisisPlan();
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch("/api/crisis-plan", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(crisisPlan),
      });

      if (!response.ok) throw new Error("Failed to save crisis plan");

      // Show success message
      alert("Crisis plan saved successfully!");
    } catch (error) {
      console.error("Error saving crisis plan:", error);
      alert("Failed to save crisis plan. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = (field) => {
    setCrisisPlan((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  };

  const removeItem = (field, index) => {
    setCrisisPlan((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const updateItem = (field, index, value) => {
    setCrisisPlan((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Crisis Response Plan</h1>
          <p className="text-gray-600 mb-8">
            Create a personalized safety plan to help you during difficult times. This plan will be
            easily accessible when you need it most.
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Emergency Contacts */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <PhoneIcon className="h-6 w-6 text-red-500" />
                Emergency Contacts
              </h2>
              <div className="space-y-4">
                {crisisPlan.emergencyContacts.map((contact, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => updateItem("emergencyContacts", index, e.target.value)}
                      placeholder="Name and phone number"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem("emergencyContacts", index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addItem("emergencyContacts")}
                  className="text-red-500 hover:text-red-700"
                >
                  + Add Contact
                </button>
              </div>
            </div>

            {/* Warning Signs */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ShieldCheckIcon className="h-6 w-6 text-red-500" />
                Warning Signs
              </h2>
              <div className="space-y-4">
                {crisisPlan.warningSigns.map((sign, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={sign}
                      onChange={(e) => updateItem("warningSigns", index, e.target.value)}
                      placeholder="Describe a warning sign"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem("warningSigns", index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addItem("warningSigns")}
                  className="text-red-500 hover:text-red-700"
                >
                  + Add Warning Sign
                </button>
              </div>
            </div>

            {/* Coping Strategies */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <HeartIcon className="h-6 w-6 text-red-500" />
                Coping Strategies
              </h2>
              <div className="space-y-4">
                {crisisPlan.copingStrategies.map((strategy, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={strategy}
                      onChange={(e) => updateItem("copingStrategies", index, e.target.value)}
                      placeholder="Describe a coping strategy"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem("copingStrategies", index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addItem("copingStrategies")}
                  className="text-red-500 hover:text-red-700"
                >
                  + Add Coping Strategy
                </button>
              </div>
            </div>

            {/* Professional Help */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <UserGroupIcon className="h-6 w-6 text-red-500" />
                Professional Help
              </h2>
              <div className="space-y-4">
                {crisisPlan.professionalHelp.map((help, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={help}
                      onChange={(e) => updateItem("professionalHelp", index, e.target.value)}
                      placeholder="Name and contact info of professional"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem("professionalHelp", index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addItem("professionalHelp")}
                  className="text-red-500 hover:text-red-700"
                >
                  + Add Professional
                </button>
              </div>
            </div>

            {/* Safe Places */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPinIcon className="h-6 w-6 text-red-500" />
                Safe Places
              </h2>
              <div className="space-y-4">
                {crisisPlan.safePlaces.map((place, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={place}
                      onChange={(e) => updateItem("safePlaces", index, e.target.value)}
                      placeholder="Describe a safe place"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem("safePlaces", index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addItem("safePlaces")}
                  className="text-red-500 hover:text-red-700"
                >
                  + Add Safe Place
                </button>
              </div>
            </div>

            {/* Personal Strengths */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <HeartIcon className="h-6 w-6 text-red-500" />
                Personal Strengths
              </h2>
              <div className="space-y-4">
                {crisisPlan.personalStrengths.map((strength, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={strength}
                      onChange={(e) => updateItem("personalStrengths", index, e.target.value)}
                      placeholder="Describe a personal strength"
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem("personalStrengths", index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addItem("personalStrengths")}
                  className="text-red-500 hover:text-red-700"
                >
                  + Add Strength
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isSaving ? "Saving..." : "Save Crisis Plan"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
