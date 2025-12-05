"use client";

import { useState, useEffect, use } from "react";
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

interface Ride {
  id: string;
  origin: string;
  destination: string;
  dateTime: string;
  pricePerSeat: number;
  seatsTotal: number;
  seatsAvailable: number;
  notes: string | null;
  createdAt: string;
  driver: Driver;
  bookings: Booking[];
}

export default function RideDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [ride, setRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);

  const fetchRide = async () => {
    try {
      const res = await fetch(`/api/rides/${id}`);
      if (!res.ok) throw new Error("Failed to fetch ride");
      const data = await res.json();
      setRide(data);
    } catch (error) {
      console.error("Error fetching ride:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRide();
  }, [id]);

  const handleBookRide = async () => {
    if (!session) {
      setBookingMessage("Please sign in to request a seat");
      return;
    }

    setIsBooking(true);
    setBookingMessage("");

    try {
      const res = await fetch(`/api/rides/${id}/book`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to book ride");
      }

      setBookingMessage("Seat requested successfully! Waiting for driver approval.");
      fetchRide();
    } catch (error) {
      setBookingMessage(
        error instanceof Error ? error.message : "Failed to book ride"
      );
    } finally {
      setIsBooking(false);
    }
  };

  const handleUpdateBooking = async (
    bookingId: string,
    status: "accepted" | "declined"
  ) => {
    setUpdatingBookingId(bookingId);

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update booking");
      }

      fetchRide();
    } catch (error) {
      console.error("Error updating booking:", error);
    } finally {
      setUpdatingBookingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA", {
      weekday: "long",
      year: "numeric",
      month: "long",
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

  const isDriver = session?.user?.id === ride?.driver.id;
  const userBooking = ride?.bookings.find(
    (b) => b.passenger.id === session?.user?.id
  );
  const pendingBookings = ride?.bookings.filter((b) => b.status === "pending");
  const acceptedBookings = ride?.bookings.filter((b) => b.status === "accepted");

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ride Not Found</h1>
          <p className="text-gray-600 mb-6">This ride may have been removed or doesn&apos;t exist.</p>
          <Link
            href="/rides"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors"
          >
            Browse Rides
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href="/rides"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to rides
        </Link>

        {/* Main Ride Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-200 mb-6">
          {/* Route & Price Header */}
          <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl md:text-3xl font-bold text-gray-900">{ride.origin}</span>
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                <span className="text-2xl md:text-3xl font-bold text-gray-900">{ride.destination}</span>
              </div>
              <div className="flex items-center gap-4 text-gray-600">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(ride.dateTime)}
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatTime(ride.dateTime)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-gray-900">${ride.pricePerSeat}</div>
              <div className="text-gray-500">per seat</div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-1">Available Seats</div>
              <div className="text-2xl font-bold text-gray-900">{ride.seatsAvailable}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-1">Total Seats</div>
              <div className="text-2xl font-bold text-gray-900">{ride.seatsTotal}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 col-span-2">
              <div className="text-sm text-gray-500 mb-1">Driver</div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">
                    {ride.driver.name?.[0] || ride.driver.email?.[0]?.toUpperCase() || "?"}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {ride.driver.name || ride.driver.email?.split("@")[0]}
                  </div>
                  <div className="text-sm text-gray-500">{ride.driver.university}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {ride.notes && (
            <div className="bg-purple-50 rounded-xl p-4 mb-8">
              <div className="text-sm font-medium text-purple-800 mb-1">Notes from driver</div>
              <p className="text-purple-900">{ride.notes}</p>
            </div>
          )}

          {/* Booking Section (for non-drivers) */}
          {!isDriver && (
            <div className="border-t border-gray-200 pt-6">
              {userBooking ? (
                <div
                  className={`p-4 rounded-xl ${
                    userBooking.status === "accepted"
                      ? "bg-green-50 border border-green-200"
                      : userBooking.status === "declined"
                      ? "bg-red-50 border border-red-200"
                      : "bg-yellow-50 border border-yellow-200"
                  }`}
                >
                  {userBooking.status === "accepted" && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-green-800">Booking Confirmed!</div>
                        <p className="text-green-700 text-sm mt-1">
                          Your seat has been confirmed. Contact the driver at{" "}
                          <span className="font-semibold">{ride.driver.email}</span> to coordinate pickup details.
                        </p>
                      </div>
                    </div>
                  )}
                  {userBooking.status === "declined" && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-red-800">Request Declined</div>
                        <p className="text-red-700 text-sm mt-1">
                          Unfortunately, your booking request was declined. Try finding another ride.
                        </p>
                      </div>
                    </div>
                  )}
                  {userBooking.status === "pending" && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-semibold text-yellow-800">Pending Approval</div>
                        <p className="text-yellow-700 text-sm mt-1">
                          Your request has been sent. The driver will review and respond soon.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={handleBookRide}
                    disabled={isBooking || ride.seatsAvailable <= 0 || !session}
                    className="w-full py-4 px-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  >
                    {isBooking ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Requesting...
                      </span>
                    ) : ride.seatsAvailable <= 0 ? (
                      "No Seats Available"
                    ) : !session ? (
                      "Sign in to Request a Seat"
                    ) : (
                      "Request a Seat"
                    )}
                  </button>
                  {bookingMessage && (
                    <p
                      className={`mt-4 text-center text-sm ${
                        bookingMessage.includes("successfully")
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {bookingMessage}
                    </p>
                  )}
                  {!session && (
                    <p className="mt-4 text-center text-sm text-gray-500">
                      <Link href="/auth/signin" className="text-purple-600 hover:text-purple-700 font-medium">
                        Sign in
                      </Link>
                      {" "}to request a seat on this ride.
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Driver Controls */}
        {isDriver && (
          <div className="space-y-6">
            {/* Pending Requests */}
            {pendingBookings && pendingBookings.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-sm font-bold">
                    {pendingBookings.length}
                  </span>
                  Pending Requests
                </h2>
                <div className="space-y-3">
                  {pendingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-xl"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-600 font-semibold">
                            {booking.passenger.name?.[0] || booking.passenger.email?.[0]?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {booking.passenger.name || booking.passenger.email?.split("@")[0]}
                          </div>
                          <div className="text-sm text-gray-500">{booking.passenger.university}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateBooking(booking.id, "accepted")}
                          disabled={updatingBookingId === booking.id}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleUpdateBooking(booking.id, "declined")}
                          disabled={updatingBookingId === booking.id}
                          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Accepted Passengers */}
            {acceptedBookings && acceptedBookings.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm font-bold">
                    {acceptedBookings.length}
                  </span>
                  Confirmed Passengers
                </h2>
                <div className="space-y-3">
                  {acceptedBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl"
                    >
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-purple-600 font-semibold">
                          {booking.passenger.name?.[0] || booking.passenger.email?.[0]?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {booking.passenger.name || booking.passenger.email?.split("@")[0]}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.passenger.email} • {booking.passenger.university}
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        Confirmed
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!pendingBookings || pendingBookings.length === 0) &&
              (!acceptedBookings || acceptedBookings.length === 0) && (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No booking requests yet</h3>
                  <p className="text-gray-500">Share your ride link to get passengers!</p>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
