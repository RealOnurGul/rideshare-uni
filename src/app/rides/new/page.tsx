"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import MapPicker from "@/components/map-picker";

interface Location {
  lat: number;
  lng: number;
  address: string;
}

export default function NewRidePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const [origin, setOrigin] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    pricePerSeat: "",
    seatsTotal: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
    }
  };

  const handleBack = () => {
    setStep(1);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateStep2()) return;

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
              <div className={`w-24 h-1 transition-colors ${step >= 2 ? "bg-purple-600" : "bg-gray-200"}`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                step >= 2 ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-500"
              }`}>
                2
              </div>
            </div>
          </div>
          <div className="flex justify-center mt-2">
            <div className="flex gap-16 text-sm">
              <span className={step === 1 ? "text-purple-600 font-medium" : "text-gray-500"}>
                Route
              </span>
              <span className={step === 2 ? "text-purple-600 font-medium" : "text-gray-500"}>
                Details
              </span>
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

        {/* Step 2: Details */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Trip Details</h2>
            <p className="text-gray-600 mb-6">Set the date, time, and price for your ride.</p>

            {/* Route Summary */}
            <div className="bg-purple-50 rounded-xl p-4 mb-6 border border-purple-100">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
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
                  onClick={handleBack}
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium cursor-pointer"
                >
                  Edit
                </button>
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
                      onChange={(e) => setFormData({ ...formData, pricePerSeat: e.target.value })}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
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
                  placeholder="Meeting point details, luggage space, music preferences..."
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
