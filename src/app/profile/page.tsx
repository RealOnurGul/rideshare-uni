"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

interface UserStats {
  ridesOffered: number;
  ridesBooked: number;
  totalEarnings: number;
  totalSpent: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState<UserStats>({
    ridesOffered: 0,
    ridesBooked: 0,
    totalEarnings: 0,
    totalSpent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!session?.user?.id) return;

      try {
        // Fetch rides to calculate stats
        const ridesRes = await fetch("/api/rides?history=true&status=all");
        const data = await ridesRes.json();
        
        // Ensure data is an array
        const allRides = Array.isArray(data) ? data : [];

        let ridesOffered = 0;
        let ridesBooked = 0;
        let totalEarnings = 0;
        let totalSpent = 0;

        for (const ride of allRides) {
          // Count rides where user is driver
          if (ride.driver?.id === session.user.id) {
            ridesOffered++;
            // Fetch ride details to get bookings
            const detailRes = await fetch(`/api/rides/${ride.id}`);
            const detail = await detailRes.json();
            const acceptedBookings = detail.bookings?.filter(
              (b: { status: string }) => b.status === "accepted"
            ).length || 0;
            totalEarnings += acceptedBookings * ride.pricePerSeat;
          }

          // Check if user booked this ride
          const detailRes = await fetch(`/api/rides/${ride.id}`);
          const detail = await detailRes.json();
          const userBooking = detail.bookings?.find(
            (b: { passenger: { id: string }; status: string }) =>
              b.passenger?.id === session.user.id && b.status === "accepted"
          );
          if (userBooking) {
            ridesBooked++;
            totalSpent += ride.pricePerSeat;
          }
        }

        setStats({ ridesOffered, ridesBooked, totalEarnings, totalSpent });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchStats();
    }
  }, [session]);

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
          <p className="text-gray-600 mb-6">You need to be signed in to view your profile.</p>
          <Link
            href="/auth/signin"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Picture */}
            <div className="relative">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt="Profile"
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-purple-100"
                />
              ) : (
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-purple-100 flex items-center justify-center border-4 border-purple-50">
                  <span className="text-purple-600 font-bold text-3xl md:text-4xl">
                    {session.user?.name?.[0] || session.user?.email?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
              )}
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full border-4 border-white"></div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {session.user?.name || "Student"}
              </h1>
              <p className="text-gray-600 mb-2">{session.user?.email}</p>
              {session.user?.university && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  </svg>
                  {session.user.university}
                </span>
              )}
              {!session.user?.university && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  University not verified
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {isLoading ? "-" : stats.ridesOffered}
            </div>
            <div className="text-sm text-gray-500">Rides Offered</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {isLoading ? "-" : stats.ridesBooked}
            </div>
            <div className="text-sm text-gray-500">Rides Taken</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">
              ${isLoading ? "-" : stats.totalEarnings}
            </div>
            <div className="text-sm text-gray-500">Total Earned</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">
              ${isLoading ? "-" : stats.totalSpent}
            </div>
            <div className="text-sm text-gray-500">Total Spent</div>
          </div>
        </div>

        {/* Account Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Account Information</h2>
          </div>
          <div className="divide-y divide-gray-100">
            <div className="p-6 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Email Address</div>
                <div className="text-sm text-gray-500">{session.user?.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                  Verified via Google
                </span>
              </div>
            </div>
            <div className="p-6 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">University Email</div>
                <div className="text-sm text-gray-500">
                  {session.user?.university ? "Verified" : "Not verified yet"}
                </div>
              </div>
              {!session.user?.university && (
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
                  Verify University
                </button>
              )}
            </div>
            <div className="p-6 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Member Since</div>
                <div className="text-sm text-gray-500">
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="divide-y divide-gray-100">
            <Link
              href="/rides/new"
              className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Offer a Ride</div>
                  <div className="text-sm text-gray-500">Share your next trip</div>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/rides"
              className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">Find a Ride</div>
                  <div className="text-sm text-gray-500">Browse available rides</div>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/dashboard"
              className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">My Dashboard</div>
                  <div className="text-sm text-gray-500">Manage rides and bookings</div>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/vehicles"
              className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-900">My Vehicles</div>
                  <div className="text-sm text-gray-500">Manage your vehicles</div>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 overflow-hidden">
          <div className="p-6 border-b border-red-100 bg-red-50">
            <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Sign Out</div>
                <div className="text-sm text-gray-500">Sign out of your account on this device</div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

