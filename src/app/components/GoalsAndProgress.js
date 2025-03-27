"use client";

import { useState, useEffect } from "react";
import { PlusIcon, TrashIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function GoalsAndProgress() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [activeGoalTab, setActiveGoalTab] = useState("active");
  const [newGoal, setNewGoal] = useState({
    title: "",
    deadline: "",
    description: "",
    type: "mood",
    target: 0,
  });

  useEffect(() => {
    getGoals();
  }, []);

  const getGoals = async () => {
    try {
      const response = await fetch("/api/goals");
      if (!response.ok) throw new Error("Failed to fetch goals");
      const data = await response.json();
      setGoals(data.goals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      setError("Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGoal),
      });

      if (!response.ok) throw new Error("Failed to create goal");

      const data = await response.json();
      setGoals([...goals, data.goal]);
      setShowGoalForm(false);
      setNewGoal({ title: "", deadline: "", description: "", type: "mood", target: 0 });
    } catch (error) {
      console.error("Error creating goal:", error);
      setError("Failed to create goal");
    }
  };

  const handleDeleteGoal = async (goalId) => {
    try {
      const response = await fetch(`/api/goals?goalId=${goalId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete goal");

      setGoals(goals.filter((goal) => goal._id !== goalId));
    } catch (error) {
      console.error("Error deleting goal:", error);
      setError("Failed to delete goal");
    }
  };

  const handleCompleteGoal = async (goalId) => {
    try {
      const response = await fetch(`/api/goals/${goalId}/complete`, {
        method: "PUT",
      });

      if (!response.ok) throw new Error("Failed to complete goal");

      const data = await response.json();
      setGoals(goals.map((goal) => (goal._id === goalId ? data.goal : goal)));
    } catch (error) {
      console.error("Error completing goal:", error);
      setError("Failed to complete goal");
    }
  };

  const isOverdue = (goal) => {
    if (!goal.deadline) return false;
    return goal.status === "active" && new Date(goal.deadline) < new Date();
  };

  const formatTargetDate = (goal) => {
    if (!goal.deadline) return "No target date";
    return new Date(goal.deadline).toLocaleDateString();
  };

  const filteredGoals = goals.filter((goal) =>
    activeGoalTab === "active" ? goal.status === "active" : goal.status === "completed"
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Goals & Progress</h2>
        <button
          onClick={() => setShowGoalForm(true)}
          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Goal
        </button>
      </div>

      {/* Goal Form Modal */}
      {showGoalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add New Goal</h3>
            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Target Date</label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
                {newGoal.deadline && new Date(newGoal.deadline) < new Date() && (
                  <p className="mt-1 text-xs text-red-500">Warning: Selected date is in the past</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={newGoal.type}
                  onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                >
                  <option value="mood">Mood</option>
                  <option value="sleep">Sleep</option>
                  <option value="activity">Activity</option>
                  <option value="social">Social</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Target Value</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: Number(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  {newGoal.type === "mood" && "Target mood value (1-5)"}
                  {newGoal.type === "sleep" && "Target sleep quality (1-5)"}
                  {newGoal.type === "activity" && "Target number of activities per day"}
                  {newGoal.type === "social" && "Target number of social interactions per day"}
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowGoalForm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Add Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goals Tabs */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setActiveGoalTab("active")}
          className={`px-3 py-1.5 text-sm font-medium rounded-md ${
            activeGoalTab === "active"
              ? "bg-indigo-100 text-indigo-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Active Goals
        </button>
        <button
          onClick={() => setActiveGoalTab("completed")}
          className={`px-3 py-1.5 text-sm font-medium rounded-md ${
            activeGoalTab === "completed"
              ? "bg-indigo-100 text-indigo-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Completed
        </button>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.length === 0 ? (
          <p className="text-gray-500 text-sm">
            {activeGoalTab === "active"
              ? "No active goals. Add one to get started!"
              : "No completed goals yet."}
          </p>
        ) : (
          filteredGoals.map((goal) => (
            <div
              key={goal._id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{goal.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{goal.description}</p>
                  <div className="mt-2 flex items-center text-xs text-gray-500">
                    <span>Target: {formatTargetDate(goal)}</span>
                    {isOverdue(goal) && <span className="ml-2 text-red-500">Overdue</span>}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {goal.status === "active" && (
                    <>
                      <button
                        onClick={() => handleCompleteGoal(goal._id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              {goal.status === "active" && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(goal.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${goal.progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
