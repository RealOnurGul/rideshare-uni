"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ALLOWED_DOMAINS } from "@/lib/allowed-domains";

interface TestUser {
  email: string;
  name: string | null;
  password: string;
}

export default function SignInPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [adminPassword, setAdminPassword] = useState("");
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminExpanded, setAdminExpanded] = useState(false);
  const [testUsers, setTestUsers] = useState<TestUser[]>([]);
  const [loadingTestUsers, setLoadingTestUsers] = useState(false);

  const handleAdminUnlock = async () => {
    if (adminPassword === "1234") {
      setAdminUnlocked(true);
      setAdminExpanded(true);
      setLoadingTestUsers(true);
      try {
        const res = await fetch("/api/admin/test-users");
        if (res.ok) {
          const data = await res.json();
          setTestUsers(data.users || []);
        }
      } catch (err) {
        console.error("Error fetching test users:", err);
      } finally {
        setLoadingTestUsers(false);
      }
    } else {
      setError("Invalid admin password");
    }
  };

  const handleTestUserClick = (user: TestUser) => {
    setFormData({
      ...formData,
      email: user.email,
      password: user.password,
    });
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");
    try {
      await signIn("google", { callbackUrl: "/rides" });
    } catch {
      setError("Failed to sign in with Google");
      setIsLoading(false);
    }
  };

  const handleManualAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isSignUp) {
        // Sign up
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to create account");
        }

        // After successful sign-up, sign in
        const signInResult = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (signInResult?.error) {
          throw new Error("Account created but failed to sign in. Please try signing in.");
        }

        // Redirect to home page - user can complete profile later via banner
        router.push("/");
      } else {
        // Sign in
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.error) {
          throw new Error("Invalid email or password");
        }

        router.push("/rides");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center p-4 relative">
      {/* Fixed Admin Bar - Top Right */}
      <div className="fixed top-20 right-4 z-50">
        {!adminExpanded ? (
          <button
            onClick={() => setAdminExpanded(true)}
            className="bg-[#5140BF] text-white px-4 py-2 rounded-lg shadow-lg hover:opacity-90 transition-all duration-200 text-sm font-medium cursor-pointer"
          >
            FOR ADMIN
          </button>
        ) : (
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-h-[calc(100vh-120px)] overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-900">FOR ADMIN</h2>
                <button
                  onClick={() => {
                    setAdminExpanded(false);
                    setAdminUnlocked(false);
                    setAdminPassword("");
                    setTestUsers([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {!adminUnlocked ? (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="adminPassword" className="block text-xs font-medium text-gray-700 mb-1">
                      Admin Password
                    </label>
                    <input
                      id="adminPassword"
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleAdminUnlock();
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5140BF] focus:border-[#5140BF] outline-none transition-all text-sm"
                      placeholder="Enter 1234"
                    />
                  </div>
                  <button
                    onClick={handleAdminUnlock}
                    className="w-full py-2 px-3 bg-[#5140BF] hover:opacity-90 text-white font-semibold rounded-lg transition-colors cursor-pointer text-sm"
                  >
                    Unlock
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-800 font-medium mb-2">✓ Unlocked</p>
                    <p className="text-xs text-green-700 mb-3">Click user to auto-fill:</p>
                    
                    {loadingTestUsers ? (
                      <div className="text-center py-3">
                        <svg className="animate-spin h-4 w-4 text-gray-500 mx-auto" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {testUsers.map((user, index) => (
                          <button
                            key={index}
                            onClick={() => handleTestUserClick(user)}
                            className="w-full text-left p-2 bg-white border border-gray-200 rounded-lg hover:border-[#5140BF] hover:bg-purple-50 transition-all cursor-pointer"
                          >
                            <div className="font-medium text-gray-900 text-xs">{user.name || "User"}</div>
                            <div className="text-xs text-gray-600 mt-0.5 truncate">{user.email}</div>
                            <div className="text-xs text-gray-500 mt-0.5">Pass: {user.password}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setAdminUnlocked(false);
                      setAdminPassword("");
                      setTestUsers([]);
                    }}
                    className="w-full py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors cursor-pointer text-xs"
                  >
                    Lock
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Sign In Form - Unchanged */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <div className="text-center mb-8 transition-all duration-300 ease-in-out">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 transition-all duration-300 ease-in-out">
              {isSignUp ? "Create an Account" : "Welcome to StudentRide"}
            </h1>
            <p className="text-gray-600 transition-all duration-300 ease-in-out">
              {isSignUp ? "Sign up to get started" : "Sign in to continue"}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Manual Sign Up/Sign In Form */}
          <form onSubmit={handleManualAuth} className="mb-6 space-y-4">
            <div className={`transition-all duration-300 ease-in-out ${isSignUp ? "max-h-40 opacity-100 mb-4 overflow-visible" : "max-h-0 opacity-0 mb-0 overflow-hidden"}`}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required={isSignUp}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required={isSignUp}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200"
                    placeholder="Doe"
                  />
                </div>
              </div>
            </div>
            <div className="transition-all duration-300 ease-in-out">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200"
                placeholder="your.email@example.com"
              />
            </div>
            <div className="transition-all duration-300 ease-in-out">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all duration-200"
                placeholder={isSignUp ? "At least 8 characters" : "Your password"}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </span>
              ) : (
                isSignUp ? "Create Account" : "Sign In"
              )}
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-4 px-4 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-gray-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
                setFormData({ firstName: "", lastName: "", email: "", password: "" });
              }}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-all duration-200 ease-in-out cursor-pointer hover:underline underline-offset-2"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>

          <div className="mt-8 p-4 bg-purple-50 rounded-xl">
            <p className="text-sm text-purple-800 font-medium mb-2">🎓 University Verification</p>
            <p className="text-sm text-purple-700 mb-3">
              After signing in, you&apos;ll verify your student status with a university email.
            </p>
            <div className="flex flex-wrap gap-2">
              {ALLOWED_DOMAINS.map((domain) => (
                <span key={domain} className="px-3 py-1 bg-white text-purple-700 rounded-full text-xs border border-purple-200">
                  @{domain}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our{" "}
              <a href="#" className="text-purple-600 hover:text-purple-700">Terms of Service</a>
              {" "}and{" "}
              <a href="#" className="text-purple-600 hover:text-purple-700">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
