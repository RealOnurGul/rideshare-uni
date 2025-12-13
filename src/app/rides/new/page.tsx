"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MapPicker from "@/components/map-picker";

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  isDefault: boolean;
}

export default function NewRidePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");

  const [preferences, setPreferences] = useState({
    luggageSpace: "medium",
    petsAllowed: false,
    smokingAllowed: false,
    musicAllowed: true,
  });

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    pricePerSeat: "",
    seatsTotal: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Restore state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("newRideFormState");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.origin) setOrigin(parsed.origin);
        if (parsed.destination) setDestination(parsed.destination);
        if (parsed.preferences) setPreferences(parsed.preferences);
        if (parsed.formData) setFormData(parsed.formData);
        if (parsed.step) setStep(parsed.step);
        // Clear after restoring
        localStorage.removeItem("newRideFormState");
      } catch (e) {
        console.error("Error restoring form state:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetchVehicles();
    }
  }, [session]);

  const fetchVehicles = async () => {
    try {
      const res = await fetch("/api/vehicles");
      if (res.ok) {
        const data = await res.json();
        setVehicles(data);
        const defaultVehicle = data.find((v: Vehicle) => v.isDefault);
        if (defaultVehicle) {
          setSelectedVehicleId(defaultVehicle.id);
        } else if (data.length > 0) {
          setSelectedVehicleId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Error fetching vehicles:", err);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const validateStep1 = () => {
    if (!origin) {
      setError("Please select a pickup location");
      return false;
    }
    if (!destination) {
      setError("Please select a dropoff location");
      return false;
    }
    setError("");
    return true;
  };

  const validateStep2 = () => {
    if (!selectedVehicleId) {
      setError("Please select a vehicle");
      return false;
    }
    setError("");
    return true;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.time) newErrors.time = "Time is required";
    if (!formData.pricePerSeat || parseFloat(formData.pricePerSeat) < 0) {
      newErrors.pricePerSeat = "Price must be 0 or positive";
    }
    if (!formData.seatsTotal || parseInt(formData.seatsTotal) < 1) {
      newErrors.seatsTotal = "Must have at least 1 seat";
    }

    const dateTime = new Date(`${formData.date}T${formData.time}`);
    if (dateTime < new Date()) {
      newErrors.date = "Ride must be in the future";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateStep3()) return;

    setIsSubmitting(true);

    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);

      const res = await fetch("/api/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: origin?.address || "",
          originLat: origin?.lat,
          originLng: origin?.lng,
          destination: destination?.address || "",
          destinationLat: destination?.lat,
          destinationLng: destination?.lng,
          dateTime: dateTime.toISOString(),
          pricePerSeat: formData.pricePerSeat,
          seatsTotal: formData.seatsTotal,
          notes: formData.notes || null,
          vehicleId: selectedVehicleId,
          ...preferences,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create ride");
      }

      const ride = await res.json();
      router.push(`/rides/${ride.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center max-w-md">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in Required</h1>
          <p className="text-gray-600 mb-6">You need to be signed in to offer a ride.</p>
          <Link
            href="/auth/signin"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!session.user?.university) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center max-w-md">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">University Verification Required</h1>
          <p className="text-gray-600 mb-6">Please verify your university email before offering a ride.</p>
          <Link
            href="/onboarding"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Complete Verification
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/rides"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mb-4 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to rides
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Offer a Ride</h1>
          <p className="text-gray-600 mt-1">Share your trip and help fellow students save on travel.</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                step >= 1 ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {step > 1 ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : "1"}
              </div>
              <div className={`w-16 md:w-24 h-1 transition-colors ${step >= 2 ? "bg-purple-600" : "bg-gray-200"}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                step >= 2 ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                {step > 2 ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : "2"}
              </div>
              <div className={`w-16 md:w-24 h-1 transition-colors ${step >= 3 ? "bg-purple-600" : "bg-gray-200"}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                step >= 3 ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                3
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <div className="flex gap-8 md:gap-12 text-sm">
              <span className={step === 1 ? "text-purple-600 font-medium" : "text-gray-500"}>Route</span>
              <span className={step === 2 ? "text-purple-600 font-medium" : "text-gray-500"}>Vehicle</span>
              <span className={step === 3 ? "text-purple-600 font-medium" : "text-gray-500"}>Details</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Step 1: Map */}
        {step === 1 && (
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Where are you going?</h2>
            <p className="text-gray-600 mb-6">Search for locations and drag the pins to fine-tune.</p>

            <MapPicker
              origin={origin}
              destination={destination}
              onOriginChange={setOrigin}
              onDestinationChange={setDestination}
            />

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                disabled={!origin || !destination}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Vehicle & Preferences */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Your Vehicle</h2>
            <p className="text-gray-600 mb-6">Choose the vehicle you'll be driving for this trip.</p>

            {loadingVehicles ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No vehicles yet</h3>
                <p className="text-gray-600 mb-4">You need to add a vehicle before offering a ride.</p>
                <button
                  onClick={() => {
                    // Save state before navigating
                    localStorage.setItem("newRideFormState", JSON.stringify({
                      origin, destination, preferences, formData, step
                    }));
                    router.push("/vehicles");
                  }}
                  className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Add a Vehicle
                </button>
              </div>
            ) : (
              <>
                <div className="grid gap-3 mb-8">
                  {vehicles.map((vehicle) => (
                    <button
                      key={vehicle.id}
                      type="button"
                      onClick={() => setSelectedVehicleId(vehicle.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        selectedVehicleId === vehicle.id
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          selectedVehicleId === vehicle.id ? "bg-purple-100" : "bg-gray-100"
                        }`}>
                          <svg className={`w-6 h-6 ${selectedVehicleId === vehicle.id ? "text-purple-600" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </span>
                            {vehicle.isDefault && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Default</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                            <span>{vehicle.color}</span>
                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">{vehicle.licensePlate}</span>
                          </div>
                        </div>
                        {selectedVehicleId === vehicle.id && (
                          <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="text-center mb-8">
                  <button
                    onClick={() => {
                      // Save state before navigating
                      localStorage.setItem("newRideFormState", JSON.stringify({
                        origin, destination, preferences, formData, step
                      }));
                      router.push("/vehicles");
                    }}
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm cursor-pointer"
                  >
                    + Add another vehicle
                  </button>
                </div>

                {/* Ride Preferences */}
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ride Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Luggage Space</label>
                    <select
                      value={preferences.luggageSpace}
                      onChange={(e) => setPreferences({ ...preferences, luggageSpace: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                    >
                      <option value="none">No luggage space</option>
                      <option value="small">Small (backpack only)</option>
                      <option value="medium">Medium (carry-on)</option>
                      <option value="large">Large (suitcases welcome)</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Allow on this ride</label>
                    <div className="flex flex-wrap gap-3">
                      <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                        preferences.petsAllowed ? "border-purple-500 bg-purple-50" : "border-gray-200"
                      }`}>
                        <input
                          type="checkbox"
                          checked={preferences.petsAllowed}
                          onChange={(e) => setPreferences({ ...preferences, petsAllowed: e.target.checked })}
                          className="sr-only"
                        />
                        <span>🐾</span>
                        <span className="text-sm font-medium">Pets</span>
                      </label>
                      <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                        preferences.smokingAllowed ? "border-purple-500 bg-purple-50" : "border-gray-200"
                      }`}>
                        <input
                          type="checkbox"
                          checked={preferences.smokingAllowed}
                          onChange={(e) => setPreferences({ ...preferences, smokingAllowed: e.target.checked })}
                          className="sr-only"
                        />
                        <span>🚬</span>
                        <span className="text-sm font-medium">Smoking</span>
                      </label>
                      <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                        preferences.musicAllowed ? "border-purple-500 bg-purple-50" : "border-gray-200"
                      }`}>
                        <input
                          type="checkbox"
                          checked={preferences.musicAllowed}
                          onChange={(e) => setPreferences({ ...preferences, musicAllowed: e.target.checked })}
                          className="sr-only"
                        />
                        <span>🎵</span>
                        <span className="text-sm font-medium">Music</span>
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={!selectedVehicleId}
                className="flex-1 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Trip Details</h2>
            <p className="text-gray-600 mb-6">Set the date, time, and price for your ride.</p>

            {/* Route & Vehicle Summary */}
            <div className="bg-purple-50 rounded-xl p-4 mb-6 border border-purple-100">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center pt-1">
                  <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                  <div className="w-0.5 h-8 bg-purple-300"></div>
                  <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                </div>
                <div className="flex-1">
                  <div className="mb-3">
                    <p className="text-xs text-purple-600 font-medium uppercase">Pickup</p>
                    <p className="text-gray-900 text-sm">{origin?.address}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-600 font-medium uppercase">Dropoff</p>
                    <p className="text-gray-900 text-sm">{destination?.address}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium cursor-pointer"
                >
                  Edit
                </button>
              </div>
              <div className="border-t border-purple-200 mt-4 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-sm text-gray-700">
                      {vehicles.find(v => v.id === selectedVehicleId)?.year}{" "}
                      {vehicles.find(v => v.id === selectedVehicleId)?.make}{" "}
                      {vehicles.find(v => v.id === selectedVehicleId)?.model}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium cursor-pointer"
                  >
                    Change
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departure Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer ${
                      errors.date ? "border-red-300" : "border-gray-200"
                    }`}
                  />
                  {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departure Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer ${
                      errors.time ? "border-red-300" : "border-gray-200"
                    }`}
                  />
                  {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Seat <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={formData.pricePerSeat}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow only one decimal place
                        if (value === "" || value === ".") {
                          setFormData({ ...formData, pricePerSeat: value });
                          return;
                        }
                        // Check if it has more than one decimal place
                        const parts = value.split(".");
                        if (parts.length > 2) {
                          return; // Don't allow multiple decimal points
                        }
                        if (parts.length === 2 && parts[1].length > 1) {
                          return; // Don't allow more than 1 decimal place
                        }
                        setFormData({ ...formData, pricePerSeat: value });
                      }}
                      placeholder="0.0"
                      min="0"
                      step="0.1"
                      className={`w-full pl-8 pr-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                        errors.pricePerSeat ? "border-red-300" : "border-gray-200"
                      }`}
                    />
                  </div>
                  {errors.pricePerSeat && <p className="mt-1 text-sm text-red-600">{errors.pricePerSeat}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Seats <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.seatsTotal}
                    onChange={(e) => setFormData({ ...formData, seatsTotal: e.target.value })}
                    placeholder="1"
                    min="1"
                    max="10"
                    className={`w-full px-4 py-3 bg-gray-50 border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors.seatsTotal ? "border-red-300" : "border-gray-200"
                    }`}
                  />
                  {errors.seatsTotal && <p className="mt-1 text-sm text-red-600">{errors.seatsTotal}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Meeting point details, stops along the way..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
                />
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Ride...
                  </span>
                ) : (
                  "Create Ride"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
