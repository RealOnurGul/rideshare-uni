"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Passenger {
  id: string;
  name: string | null;
  email: string | null;
  university: string | null;
}

interface Booking {
  id: string;
  status: string;
  createdAt: string;
  passenger: Passenger;
}

interface Driver {
  id: string;
  name: string | null;
  email: string | null;
  university: string | null;
}

interface RideInfo {
  id: string;
  origin: string;
  destination: string;
  dateTime: string;
}

interface BookingWithRide {
  id: string;
  status: string;
  createdAt: string;
  ride: RideInfo;
}

interface Ride {
  id: string;
  origin: string;
  destination: string;
  dateTime: string;
  pricePerSeat: number;
  seatsTotal: number;
  seatsAvailable: number;
  notes: string | null;
  driver: Driver;
  bookings: Booking[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [myRides, setMyRides] = useState<Ride[]>([]);
  const [myBookings, setMyBookings] = useState<BookingWithRide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"driving" | "passenger">("driving");

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;

      try {
        const ridesRes = await fetch("/api/rides");
        const allRides = await ridesRes.json();

        const myDrivingRides: Ride[] = [];
        const myPassengerBookings: BookingWithRide[] = [];

        for (const ride of allRides) {
          if (ride.driver.id === session.user.id) {
            const detailRes = await fetch(`/api/rides/${ride.id}`);
            const detailData = await detailRes.json();
            myDrivingRides.push(detailData);
          }
        }

        setMyRides(myDrivingRides);

        for (const ride of allRides) {
          const detailRes = await fetch(`/api/rides/${ride.id}`);
          const detailData = await detailRes.json();

          const userBooking = detailData.bookings?.find(
            (b: Booking) => b.passenger.id === session.user.id
          );

          if (userBooking) {
            myPassengerBookings.push({
              ...userBooking,
              ride: {
                id: detailData.id,
                origin: detailData.origin,
                destination: detailData.destination,
                dateTime: detailData.dateTime,
              },
            });
          }
        }

        setMyBookings(myPassengerBookings);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-CA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      accepted: "bg-green-100 text-green-700 border-green-200",
      declined: "bg-red-100 text-red-700 border-red-200",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium border ${
          styles[status as keyof typeof styles] || styles.pending
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (status === "loading" || isLoading) {
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
          <p className="text-gray-600 mb-6">
            You need to be signed in to view your dashboard.
          </p>
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
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {session.user?.name || session.user?.email?.split("@")[0]}!
              </p>
            </div>
            <Link
              href="/rides/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Offer a Ride
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("driving")}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "driving"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              My Rides ({myRides.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab("passenger")}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === "passenger"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              My Bookings ({myBookings.length})
            </span>
          </button>
        </div>

        {/* Driving Tab */}
        {activeTab === "driving" && (
          <div className="space-y-4">
            {myRides.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No rides yet</h3>
                <p className="text-gray-600 mb-6">
                  You haven&apos;t offered any rides yet. Start sharing your commute!
                </p>
                <Link
                  href="/rides/new"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Offer a Ride
                </Link>
              </div>
            ) : (
              myRides.map((ride) => (
                <div
                  key={ride.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                    <div>
                      <Link
                        href={`/rides/${ride.id}`}
                        className="inline-flex items-center gap-2 text-xl font-semibold text-gray-900 hover:text-purple-600 transition-colors"
                      >
                        {ride.origin}
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        {ride.destination}
                      </Link>
                      <div className="flex items-center gap-4 text-gray-600 mt-1">
                        <span>{formatDate(ride.dateTime)}</span>
                        <span>{formatTime(ride.dateTime)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600">
                        {ride.seatsAvailable}/{ride.seatsTotal} seats
                      </span>
                      <span className="text-2xl font-bold text-gray-900">
                        ${ride.pricePerSeat}
                      </span>
                    </div>
                  </div>

                  {/* Bookings for this ride */}
                  {ride.bookings && ride.bookings.length > 0 && (
                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <div className="text-sm font-medium text-gray-700 mb-3">
                        Booking Requests ({ride.bookings.length})
                      </div>
                      <div className="space-y-2">
                        {ride.bookings.slice(0, 3).map((booking) => (
                          <div
                            key={booking.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                <span className="text-purple-600 text-sm font-semibold">
                                  {booking.passenger.name?.[0] || booking.passenger.email?.[0]?.toUpperCase() || "?"}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-900">
                                  {booking.passenger.name || booking.passenger.email?.split("@")[0]}
                                </span>
                                <span className="text-gray-400 mx-2">•</span>
                                <span className="text-gray-500 text-sm">{booking.passenger.university}</span>
                              </div>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>
                        ))}
                        {ride.bookings.length > 3 && (
                          <p className="text-sm text-gray-500 pl-2">
                            +{ride.bookings.length - 3} more
                          </p>
                        )}
                      </div>
                      <Link
                        href={`/rides/${ride.id}`}
                        className="inline-flex items-center gap-1 mt-4 text-purple-600 hover:text-purple-700 text-sm font-medium"
                      >
                        Manage bookings
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Passenger Tab */}
        {activeTab === "passenger" && (
          <div className="space-y-4">
            {myBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-600 mb-6">
                  You haven&apos;t booked any rides yet. Find your next trip!
                </p>
                <Link
                  href="/rides"
                  className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Browse Rides
                </Link>
              </div>
            ) : (
              myBookings.map((booking) => (
                <Link
                  key={booking.id}
                  href={`/rides/${booking.ride.id}`}
                  className="block bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:border-purple-300 transition-all"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 text-xl font-semibold text-gray-900 mb-1">
                        {booking.ride.origin}
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        {booking.ride.destination}
                      </div>
                      <div className="flex items-center gap-4 text-gray-600">
                        <span>{formatDate(booking.ride.dateTime)}</span>
                        <span>{formatTime(booking.ride.dateTime)}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
