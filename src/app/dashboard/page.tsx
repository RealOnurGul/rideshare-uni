"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Passenger {
  id: string;
  name: string | null;
  email: string | null;
  university: string | null;
  image: string | null;
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
  image: string | null;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
}

interface RideInfo {
  id: string;
  origin: string;
  destination: string;
  dateTime: string;
  status: string;
  driver: Driver;
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
  status: string;
  notes: string | null;
  luggageSpace: string;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  musicAllowed: boolean;
  driver: Driver;
  vehicle: Vehicle | null;
  bookings: Booking[];
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [myRides, setMyRides] = useState<Ride[]>([]);
  const [myBookings, setMyBookings] = useState<BookingWithRide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"driving" | "passenger">("driving");
  const [showHistory, setShowHistory] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      // Fetch all rides including history
      const ridesRes = await fetch("/api/rides?history=true&status=all");
      const data = await ridesRes.json();
      
      // Ensure data is an array
      const allRides = Array.isArray(data) ? data : [];

      const myDrivingRides: Ride[] = [];
      const myPassengerBookings: BookingWithRide[] = [];

      for (const ride of allRides) {
        if (ride.driver?.id === session.user.id) {
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
          (b: Booking) => b.passenger?.id === session.user.id
        );

        if (userBooking) {
          myPassengerBookings.push({
            ...userBooking,
            ride: {
              id: detailData.id,
              origin: detailData.origin,
              destination: detailData.destination,
              dateTime: detailData.dateTime,
              status: detailData.status,
              driver: detailData.driver,
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
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchData();
    }
  }, [session, fetchData]);

  const handleCancelRide = async (rideId: string) => {
    if (!confirm("Are you sure you want to cancel this ride? All passengers will be notified.")) return;

    setActionLoading(rideId);
    try {
      const res = await fetch(`/api/rides/${rideId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error cancelling ride:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteRide = async (rideId: string) => {
    setActionLoading(rideId);
    try {
      const res = await fetch(`/api/rides/${rideId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error completing ride:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    setActionLoading(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBookingAction = async (bookingId: string, action: "accepted" | "declined") => {
    setActionLoading(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Error updating booking:", error);
    } finally {
      setActionLoading(null);
    }
  };

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
    const styles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      accepted: "bg-green-100 text-green-700 border-green-200",
      declined: "bg-red-100 text-red-700 border-red-200",
      cancelled: "bg-gray-100 text-gray-600 border-gray-200",
      upcoming: "bg-blue-100 text-blue-700 border-blue-200",
      completed: "bg-green-100 text-green-700 border-green-200",
      in_progress: "bg-purple-100 text-purple-700 border-purple-200",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${styles[status] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
      </span>
    );
  };

  const isUpcoming = (dateTime: string, status: string) => {
    return new Date(dateTime) > new Date() && status === "upcoming";
  };

  const filteredRides = myRides.filter((ride) => 
    showHistory ? true : isUpcoming(ride.dateTime, ride.status)
  );

  const filteredBookings = myBookings.filter((booking) =>
    showHistory ? true : (isUpcoming(booking.ride.dateTime, booking.ride.status) && booking.status !== "cancelled" && booking.status !== "declined")
  );

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
          <p className="text-gray-600 mb-6">You need to be signed in to view your dashboard.</p>
          <Link href="/auth/signin" className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors cursor-pointer">
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
            <div className="flex gap-3">
              <Link href="/vehicles" className="inline-flex items-center gap-2 px-5 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                My Vehicles
              </Link>
              <Link href="/rides/new" className="inline-flex items-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Offer a Ride
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs and History Toggle */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("driving")}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === "driving" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                My Rides ({filteredRides.length})
              </span>
            </button>
            <button
              onClick={() => setActiveTab("passenger")}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all cursor-pointer ${
                activeTab === "passenger" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
                My Bookings ({filteredBookings.length})
              </span>
            </button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showHistory}
              onChange={(e) => setShowHistory(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded cursor-pointer"
            />
            <span className="text-sm text-gray-600">Show history</span>
          </label>
        </div>

        {/* Driving Tab */}
        {activeTab === "driving" && (
          <div className="space-y-4">
            {filteredRides.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {showHistory ? "No rides in history" : "No upcoming rides"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {showHistory ? "Your past rides will appear here." : "You haven't offered any rides yet. Start sharing your commute!"}
                </p>
                <Link href="/rides/new" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors cursor-pointer">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Offer a Ride
                </Link>
              </div>
            ) : (
              filteredRides.map((ride) => (
                <div key={ride.id} className={`bg-white rounded-2xl p-6 shadow-sm border ${ride.status === "cancelled" ? "border-gray-300 opacity-75" : "border-gray-200"}`}>
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <Link href={`/rides/${ride.id}`} className="inline-flex items-center gap-2 text-xl font-semibold text-gray-900 hover:text-purple-600 transition-colors cursor-pointer">
                          {ride.origin.split(",")[0]}
                          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                          {ride.destination.split(",")[0]}
                        </Link>
                        {getStatusBadge(ride.status)}
                      </div>
                      <div className="flex items-center gap-4 text-gray-600 mt-1">
                        <span>{formatDate(ride.dateTime)}</span>
                        <span>{formatTime(ride.dateTime)}</span>
                        {ride.vehicle && (
                          <span className="text-sm">
                            {ride.vehicle.color} {ride.vehicle.make} {ride.vehicle.model}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600">{ride.seatsAvailable}/{ride.seatsTotal} seats</span>
                      <span className="text-2xl font-bold text-gray-900">${ride.pricePerSeat}</span>
                    </div>
                  </div>

                  {/* Ride Actions */}
                  {ride.status === "upcoming" && (
                    <div className="flex gap-2 mb-4">
                      <button
                        onClick={() => handleCompleteRide(ride.id)}
                        disabled={actionLoading === ride.id}
                        className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Mark Complete
                      </button>
                      <button
                        onClick={() => handleCancelRide(ride.id)}
                        disabled={actionLoading === ride.id}
                        className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Cancel Ride
                      </button>
                    </div>
                  )}

                  {/* Bookings for this ride */}
                  {ride.bookings && ride.bookings.length > 0 && (
                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <div className="text-sm font-medium text-gray-700 mb-3">
                        Booking Requests ({ride.bookings.filter(b => b.status !== "cancelled" && b.status !== "declined").length})
                      </div>
                      <div className="space-y-2">
                        {ride.bookings.filter(b => showHistory || (b.status !== "cancelled" && b.status !== "declined")).map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              {booking.passenger.image ? (
                                <img src={booking.passenger.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                  <span className="text-purple-600 text-sm font-semibold">
                                    {booking.passenger.name?.[0] || "P"}
                                  </span>
                                </div>
                              )}
                              <div>
                                <span className="font-medium text-gray-900">
                                  {booking.passenger.name || "Passenger"}
                                </span>
                                {booking.passenger.university && (
                                  <>
                                    <span className="text-gray-400 mx-2">•</span>
                                    <span className="text-gray-500 text-sm">{booking.passenger.university}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {booking.status === "pending" && ride.status === "upcoming" ? (
                                <>
                                  <button
                                    onClick={() => handleBookingAction(booking.id, "accepted")}
                                    disabled={actionLoading === booking.id}
                                    className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                  >
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleBookingAction(booking.id, "declined")}
                                    disabled={actionLoading === booking.id}
                                    className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                  >
                                    Decline
                                  </button>
                                </>
                              ) : (
                                getStatusBadge(booking.status)
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
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
            {filteredBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {showHistory ? "No bookings in history" : "No upcoming bookings"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {showHistory ? "Your past bookings will appear here." : "You haven't booked any rides yet. Find your next trip!"}
                </p>
                <Link href="/rides" className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors cursor-pointer">
                  Browse Rides
                </Link>
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`bg-white rounded-2xl p-6 shadow-sm border ${
                    booking.status === "cancelled" || booking.ride.status === "cancelled"
                      ? "border-gray-300 opacity-75"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <Link
                        href={`/rides/${booking.ride.id}`}
                        className="inline-flex items-center gap-2 text-xl font-semibold text-gray-900 hover:text-purple-600 transition-colors cursor-pointer"
                      >
                        {booking.ride.origin.split(",")[0]}
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                        {booking.ride.destination.split(",")[0]}
                      </Link>
                      <div className="flex items-center gap-4 text-gray-600 mt-1">
                        <span>{formatDate(booking.ride.dateTime)}</span>
                        <span>{formatTime(booking.ride.dateTime)}</span>
                        <span className="text-sm">Driver: {booking.ride.driver.name || "Unknown"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(booking.status)}
                      {booking.ride.status === "cancelled" && (
                        <span className="text-sm text-red-600 font-medium">Ride cancelled</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Cancel booking option */}
                  {booking.status !== "cancelled" && booking.status !== "declined" && booking.ride.status === "upcoming" && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={actionLoading === booking.id}
                        className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      >
                        Cancel Booking
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

