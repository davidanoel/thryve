"use client";

import { useState, useEffect } from "react";
import {
  PhoneIcon,
  PlusIcon,
  UserGroupIcon,
  ChevronDownIcon,
  TrashIcon,
  EnvelopeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    getEmergencyContacts();
  }, []);

  const getEmergencyContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/emergency-contacts");
      if (!response.ok) throw new Error("Failed to fetch contacts");
      const data = await response.json();
      setContacts(data.contacts);
    } catch (error) {
      console.error("Error getting emergency contacts:", error);
      setError("Failed to load emergency contacts");
    } finally {
      setLoading(false);
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

      if (!response.ok) throw new Error("Failed to add contact");

      const data = await response.json();
      setContacts([...contacts, data.contact]);
      setShowContactForm(false);
    } catch (error) {
      console.error("Error adding emergency contact:", error);
      setError("Failed to add emergency contact");
    }
  };

  const handleDeleteEmergencyContact = async (contactId) => {
    try {
      const response = await fetch(`/api/emergency-contacts?id=${contactId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete contact");

      setContacts(contacts.filter((c) => c._id !== contactId));
    } catch (error) {
      console.error("Error deleting emergency contact:", error);
      setError("Failed to delete emergency contact");
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

      if (!response.ok) throw new Error("Failed to update contact");

      const data = await response.json();
      setContacts(contacts.map((c) => (c._id === editingContact._id ? data.data : c)));
      setShowContactForm(false);
      setEditingContact(null);
    } catch (error) {
      console.error("Error updating emergency contact:", error);
      setError("Failed to update emergency contact");
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          <PhoneIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
          Emergency Contacts
        </h2>
        <button
          onClick={() => {
            setEditingContact(null);
            setShowContactForm(true);
          }}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add Contact
        </button>
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}

      {contacts.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No emergency contacts added yet.</p>
      ) : (
        <div className="space-y-6">
          {/* Summary Section */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full flex items-center justify-center bg-red-100">
                  <PhoneIcon className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Emergency Contacts</div>
                  <div className="text-lg font-medium">{contacts.length} contacts</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Verified Contacts</div>
                <div className="text-lg font-medium">
                  {contacts.filter((c) => c.isVerified).length}
                </div>
              </div>
            </div>
          </div>

          {/* Contacts List */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center">
                <UserGroupIcon className="h-5 w-5 text-red-500 mr-2" />
                <h4 className="text-base font-medium text-gray-900">Contact List</h4>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-red-600 font-medium">{contacts.length} contacts</span>
                <ChevronDownIcon
                  className={`h-5 w-5 text-gray-400 transform transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>
            {isExpanded && (
              <div className="p-4 bg-gray-50 space-y-4">
                {contacts.map((contact) => (
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
                            setShowContactForm(true);
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

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingContact ? "Edit Emergency Contact" : "Add Emergency Contact"}
              </h3>
              <button
                onClick={() => {
                  setShowContactForm(false);
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
                <label htmlFor="relationship" className="block text-sm font-medium text-gray-700">
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
                  Phone Number
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
                <label htmlFor="alertThreshold" className="block text-sm font-medium text-gray-700">
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
                  <option value="high">High Risk</option>
                  <option value="critical">Critical Risk</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Methods
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="notificationMethods"
                      value="email"
                      defaultChecked={editingContact?.notificationPreferences?.methods.includes(
                        "email"
                      )}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Email</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="notificationMethods"
                      value="sms"
                      defaultChecked={editingContact?.notificationPreferences?.methods.includes(
                        "sms"
                      )}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">SMS</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowContactForm(false);
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
  );
}
