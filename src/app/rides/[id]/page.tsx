"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import RideDetailMap from "@/components/ride-detail-map";

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

interface Ride {
  id: string;
  origin: string;
  originLat: number | null;
  originLng: number | null;
  destination: string;
  destinationLat: number | null;
  destinationLng: number | null;
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

      setBookingMessage("Seat requested successfully!");
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

  const hasMapCoords = ride.originLat && ride.originLng && ride.destinationLat && ride.destinationLng;

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                      <span className="text-xl font-bold text-gray-900">{ride.origin}</span>
                    </div>
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                      <span className="text-xl font-bold text-gray-900">{ride.destination}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(ride.dateTime)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatTime(ride.dateTime)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-600">${ride.pricePerSeat}</div>
                  <div className="text-gray-500 text-sm">per seat</div>
                </div>
              </div>

              {/* Map */}
              {hasMapCoords && (
                <RideDetailMap
                  originLat={ride.originLat!}
                  originLng={ride.originLng!}
                  originAddress={ride.origin}
                  destinationLat={ride.destinationLat!}
                  destinationLng={ride.destinationLng!}
                  destinationAddress={ride.destination}
                />
              )}
            </div>

            {/* Notes */}
            {ride.notes && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Trip Notes</h3>
                <p className="text-gray-600">{ride.notes}</p>
              </div>
            )}

            {/* Driver Bookings Management */}
            {isDriver && (
              <div className="space-y-4">
                {pendingBookings && pendingBookings.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-xs font-bold">
                        {pendingBookings.length}
                      </span>
                      Pending Requests
                    </h3>
                    <div className="space-y-3">
                      {pendingBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-100 rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            {booking.passenger.image ? (
                              <img src={booking.passenger.image} alt="" className="w-10 h-10 rounded-full" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <span className="text-purple-600 font-semibold">
                                  {booking.passenger.name?.[0] || "?"}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900">
                                {booking.passenger.name || booking.passenger.email?.split("@")[0]}
                              </p>
                              <p className="text-sm text-gray-500">{booking.passenger.university}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateBooking(booking.id, "accepted")}
                              disabled={updatingBookingId === booking.id}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateBooking(booking.id, "declined")}
                              disabled={updatingBookingId === booking.id}
                              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {acceptedBookings && acceptedBookings.length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-xs font-bold">
                        {acceptedBookings.length}
                      </span>
                      Confirmed Passengers
                    </h3>
                    <div className="space-y-3">
                      {acceptedBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl"
                        >
                          {booking.passenger.image ? (
                            <img src={booking.passenger.image} alt="" className="w-10 h-10 rounded-full" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <span className="text-purple-600 font-semibold">
                                {booking.passenger.name?.[0] || "?"}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {booking.passenger.name || booking.passenger.email?.split("@")[0]}
                            </p>
                            <p className="text-sm text-gray-500">
                              {booking.passenger.email} • {booking.passenger.university}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Driver Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Driver</h3>
              <div className="flex items-center gap-4">
                {ride.driver.image ? (
                  <img src={ride.driver.image} alt="" className="w-14 h-14 rounded-full" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-xl">
                      {ride.driver.name?.[0] || "?"}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">
                    {ride.driver.name || ride.driver.email?.split("@")[0]}
                  </p>
                  <p className="text-sm text-gray-500">{ride.driver.university}</p>
                </div>
              </div>
            </div>

            {/* Seats Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Availability</h3>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">Available Seats</span>
                <span className="text-2xl font-bold text-purple-600">{ride.seatsAvailable}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${((ride.seatsTotal - ride.seatsAvailable) / ride.seatsTotal) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {ride.seatsTotal - ride.seatsAvailable} of {ride.seatsTotal} seats booked
              </p>
            </div>

            {/* Booking Card */}
            {!isDriver && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                {userBooking ? (
                  <div>
                    {userBooking.status === "accepted" && (
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-green-800 mb-2">Booking Confirmed!</h3>
                        <p className="text-sm text-gray-600">
                          Contact the driver at <span className="font-medium">{ride.driver.email}</span>
                        </p>
                      </div>
                    )}
                    {userBooking.status === "pending" && (
                      <div className="text-center">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-yellow-800 mb-2">Pending Approval</h3>
                        <p className="text-sm text-gray-600">Waiting for driver confirmation</p>
                      </div>
                    )}
                    {userBooking.status === "declined" && (
                      <div className="text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-red-800 mb-2">Request Declined</h3>
                        <p className="text-sm text-gray-600">Try finding another ride</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={handleBookRide}
                      disabled={isBooking || ride.seatsAvailable <= 0 || !session}
                      className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed btn-press"
                    >
                      {isBooking ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Requesting...
                        </span>
                      ) : ride.seatsAvailable <= 0 ? (
                        "No Seats Available"
                      ) : !session ? (
                        "Sign in to Book"
                      ) : (
                        "Request a Seat"
                      )}
                    </button>
                    {bookingMessage && (
                      <p className={`mt-3 text-sm text-center ${
                        bookingMessage.includes("success") ? "text-green-600" : "text-red-600"
                      }`}>
                        {bookingMessage}
                      </p>
                    )}
                    {!session && (
                      <p className="mt-3 text-sm text-center text-gray-500">
                        <Link href="/auth/signin" className="text-purple-600 hover:text-purple-700 font-medium">
                          Sign in
                        </Link>{" "}to request a seat
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
