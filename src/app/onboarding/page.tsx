"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ALLOWED_DOMAINS } from "@/lib/allowed-domains";

export default function OnboardingPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    universityEmail: "",
    phone: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
    // If already onboarded, redirect to dashboard
    if (session?.user?.university) {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const validateEmail = (email: string) => {
    const domain = email.split("@")[1]?.toLowerCase();
    return ALLOWED_DOMAINS.includes(domain);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate university email
    if (!formData.universityEmail) {
      setError("University email is required");
      return;
    }

    if (!validateEmail(formData.universityEmail)) {
      setError("Please use a valid university email (@mcgill.ca, @concordia.ca, or @umontreal.ca)");
      return;
    }

    // Validate phone (optional but if provided, should be valid)
    if (formData.phone && !/^[\d\s\-\+\(\)]{10,}$/.test(formData.phone)) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          universityEmail: formData.universityEmail,
          phone: formData.phone || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to complete profile");
      }

      // Update the session to reflect the changes
      await update();
      
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
            <p className="text-gray-600 mt-2">
              Welcome, {session?.user?.name || "there"}! Just a few more details to get started.
            </p>
          </div>

          {/* Signed in as */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 flex items-center gap-4">
            {session?.user?.image ? (
              <img src={session.user.image} alt="" className="w-12 h-12 rounded-full" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 font-bold text-lg">
                  {session?.user?.name?.[0] || "?"}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">{session?.user?.name}</p>
              <p className="text-sm text-gray-500">{session?.user?.email}</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* University Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                University Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.universityEmail}
                onChange={(e) => setFormData({ ...formData, universityEmail: e.target.value })}
                placeholder="your.name@mcgill.ca"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Accepted: @mcgill.ca, @concordia.ca, @umontreal.ca
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (514) 123-4567"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500">
                For ride coordination. Only shared with confirmed ride partners.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                "Complete Profile"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            By continuing, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
