"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import RideDetailMap from "@/components/ride-detail-map";
import { MockPayment } from "@/components/mock-payment";
import { CancellationPolicy } from "@/components/cancellation-policy";

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
  paymentStatus: string | null;
  paymentAmount: number | null;
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
  licensePlate: string;
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
  status: string;
  luggageSpace: string;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  musicAllowed: boolean;
  notes: string | null;
  createdAt: string;
  driver: Driver;
  vehicle: Vehicle | null;
  bookings: Booking[];
}

export default function RideDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [ride, setRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showCancellationPolicy, setShowCancellationPolicy] = useState(false);

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

    // Check if user has verified university
    if (!session.user?.university) {
      setBookingMessage("Please verify your university email first. Go to your profile to complete verification.");
      return;
    }

    // Show cancellation policy first
    setShowCancellationPolicy(true);
  };

  const handleAcceptPolicy = () => {
    setShowCancellationPolicy(false);
    setShowPayment(true);
  };

  const handlePaymentSuccess = async () => {
    setIsBooking(true);
    setBookingMessage("");

    try {
      const res = await fetch(`/api/rides/${id}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentConfirmed: true }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to book ride");
      }

      setShowPayment(false);
      setBookingMessage("Seat requested successfully! Payment held until ride completion.");
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

  const handleCancelRide = async () => {
    if (!confirm("Are you sure you want to cancel this ride? All passengers will be notified.")) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/rides/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (res.ok) {
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error cancelling ride:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel your booking?")) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (res.ok) {
        fetchRide();
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
    } finally {
      setActionLoading(false);
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

  const formatPrice = (price: number): string => {
    return price.toFixed(2);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-CA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLuggageLabel = (size: string) => {
    const labels: Record<string, string> = {
      none: "No luggage space",
      small: "Small (backpack)",
      medium: "Medium (carry-on)",
      large: "Large (suitcases)",
    };
    return labels[size] || "Medium";
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      upcoming: "bg-blue-100 text-blue-700",
      in_progress: "bg-purple-100 text-purple-700",
      completed: "bg-green-100 text-green-700",
      cancelled: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status] || styles.upcoming}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
      </span>
    );
  };

  const isDriver = session?.user?.id === ride?.driver.id;
  const userBooking = ride?.bookings.find(
    (b) => b.passenger.id === session?.user?.id
  );
  const pendingBookings = ride?.bookings.filter((b) => b.status === "pending");
  const acceptedBookings = ride?.bookings.filter((b) => b.status === "accepted");
  
  // Check if user is a member (driver or accepted passenger)
  const isMember = isDriver || (userBooking?.status === "accepted");

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
          <Link href="/rides" className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors cursor-pointer">
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
        <Link href="/rides" className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mb-6 cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to rides
        </Link>

        {/* Status Banner */}
        {ride.status !== "upcoming" && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
            ride.status === "cancelled" ? "bg-red-50 border border-red-200" :
            ride.status === "completed" ? "bg-green-50 border border-green-200" :
            "bg-purple-50 border border-purple-200"
          }`}>
            {ride.status === "cancelled" && (
              <>
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="font-medium text-red-700">This ride has been cancelled</span>
              </>
            )}
            {ride.status === "completed" && (
              <>
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="font-medium text-green-700">This ride has been completed</span>
              </>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Route Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    {getStatusBadge(ride.status)}
                    {isMember && (
                      <Link
                        href={`/chats?rideId=${ride.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#5140BF] hover:opacity-90 text-white font-medium rounded-lg transition-all cursor-pointer text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        Chat
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                      <span className="text-xl font-bold text-gray-900">{ride.origin.split(",")[0]}</span>
                    </div>
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                      <span className="text-xl font-bold text-gray-900">{ride.destination.split(",")[0]}</span>
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
                  <div className="text-3xl font-bold text-purple-600">${formatPrice(ride.pricePerSeat)}</div>
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

            {/* Vehicle & Preferences */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              {ride.vehicle && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Vehicle</h3>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {ride.vehicle.year} {ride.vehicle.make} {ride.vehicle.model}
                      </p>
                      <p className="text-sm text-gray-600">
                        {ride.vehicle.color} • {ride.vehicle.licensePlate}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <h3 className="font-semibold text-gray-900 mb-3">Ride Preferences</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="text-lg">🧳</span>
                  <span className="text-sm text-gray-700">{getLuggageLabel(ride.luggageSpace)}</span>
                </div>
                <div className={`flex items-center gap-2 p-3 rounded-lg ${ride.petsAllowed ? "bg-green-50" : "bg-gray-50"}`}>
                  <span className="text-lg">🐾</span>
                  <span className={`text-sm ${ride.petsAllowed ? "text-green-700" : "text-gray-500"}`}>
                    {ride.petsAllowed ? "Pets allowed" : "No pets"}
                  </span>
                </div>
                <div className={`flex items-center gap-2 p-3 rounded-lg ${ride.smokingAllowed ? "bg-green-50" : "bg-gray-50"}`}>
                  <span className="text-lg">🚬</span>
                  <span className={`text-sm ${ride.smokingAllowed ? "text-green-700" : "text-gray-500"}`}>
                    {ride.smokingAllowed ? "Smoking allowed" : "No smoking"}
                  </span>
                </div>
                <div className={`flex items-center gap-2 p-3 rounded-lg ${ride.musicAllowed ? "bg-green-50" : "bg-gray-50"}`}>
                  <span className="text-lg">🎵</span>
                  <span className={`text-sm ${ride.musicAllowed ? "text-green-700" : "text-gray-500"}`}>
                    {ride.musicAllowed ? "Music on" : "No music"}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {ride.notes && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">Trip Notes</h3>
                <p className="text-gray-600">{ride.notes}</p>
              </div>
            )}

            {/* Driver Bookings Management */}
            {isDriver && ride.status === "upcoming" && (
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
                        <div key={booking.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
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
                                {booking.passenger.name || "Passenger"}
                              </p>
                              <p className="text-sm text-gray-500">{booking.passenger.university}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateBooking(booking.id, "accepted")}
                              disabled={updatingBookingId === booking.id}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateBooking(booking.id, "declined")}
                              disabled={updatingBookingId === booking.id}
                              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
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
                        <Link 
                          key={booking.id} 
                          href={`/users/${booking.passenger.id}`}
                          className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-xl hover:bg-green-100 transition-colors cursor-pointer"
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
                            <p className="font-medium text-gray-900 hover:text-purple-600 transition-colors">
                              {booking.passenger.name || "Passenger"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {booking.passenger.university}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cancel Ride Button */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Actions</h3>
                  <button
                    onClick={handleCancelRide}
                    disabled={actionLoading}
                    className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel This Ride
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Driver Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Driver</h3>
              <Link href={`/users/${ride.driver.id}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer">
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
                  <p className="font-semibold text-gray-900 hover:text-purple-600 transition-colors">
                    {ride.driver.name || "Driver"}
                  </p>
                  <p className="text-sm text-gray-500">{ride.driver.university}</p>
                </div>
              </Link>
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
            {!isDriver && ride.status === "upcoming" && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                {showCancellationPolicy ? (
                  <CancellationPolicy
                    rideDateTime={ride.dateTime}
                    onAccept={handleAcceptPolicy}
                    onCancel={() => setShowCancellationPolicy(false)}
                  />
                ) : showPayment ? (
                  <MockPayment
                    amount={ride.pricePerSeat}
                    onSuccess={handlePaymentSuccess}
                    onCancel={() => setShowPayment(false)}
                    isProcessing={isBooking}
                  />
                ) : userBooking ? (
                  <div>
                    {userBooking.status === "accepted" && (
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-green-800 mb-2">Booking Confirmed!</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          You&apos;re all set! The driver will contact you before the ride.
                        </p>
                        {userBooking.paymentStatus === "held" && (
                          <p className="text-xs text-purple-600 bg-purple-50 px-3 py-1 rounded-lg inline-block mb-4">
                            💳 ${userBooking.paymentAmount?.toFixed(2)} held until ride completion
                          </p>
                        )}
                        <button
                          onClick={() => handleCancelBooking(userBooking.id)}
                          disabled={actionLoading}
                          className="text-sm text-red-600 hover:text-red-700 font-medium cursor-pointer disabled:opacity-50"
                        >
                          Cancel my booking
                        </button>
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
                        <p className="text-sm text-gray-600 mb-2">Waiting for driver confirmation</p>
                        {userBooking.paymentStatus === "held" && (
                          <p className="text-xs text-purple-600 bg-purple-50 px-3 py-1 rounded-lg inline-block mb-4">
                            💳 ${userBooking.paymentAmount?.toFixed(2)} held securely
                          </p>
                        )}
                        <button
                          onClick={() => handleCancelBooking(userBooking.id)}
                          disabled={actionLoading}
                          className="text-sm text-red-600 hover:text-red-700 font-medium cursor-pointer disabled:opacity-50"
                        >
                          Cancel request
                        </button>
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
                        <p className="text-sm text-gray-600 mb-1">Try finding another ride</p>
                        <p className="text-xs text-gray-500">Your payment has been refunded</p>
                      </div>
                    )}
                    {userBooking.status === "cancelled" && (
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-gray-800 mb-2">Booking Cancelled</h3>
                        <p className="text-sm text-gray-600">You cancelled this booking</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="text-center mb-4">
                      <div className="text-3xl font-bold text-purple-600">${formatPrice(ride.pricePerSeat)}</div>
                      <div className="text-sm text-gray-500">per seat</div>
                    </div>
                    <button
                      onClick={handleBookRide}
                      disabled={isBooking || ride.seatsAvailable <= 0 || !session}
                      className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isBooking ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Processing...
                        </span>
                      ) : ride.seatsAvailable <= 0 ? (
                        "No Seats Available"
                      ) : !session ? (
                        "Sign in to Book"
                      ) : !session.user?.university ? (
                        "Verify University First"
                      ) : (
                        "Book & Pay Now"
                      )}
                    </button>
                    <p className="mt-3 text-xs text-center text-gray-500">
                      Payment held until ride completion
                    </p>
                    {bookingMessage && (
                      <p className={`mt-3 text-sm text-center ${
                        bookingMessage.includes("success") ? "text-green-600" : "text-red-600"
                      }`}>
                        {bookingMessage}
                      </p>
                    )}
                    {!session && (
                      <p className="mt-3 text-sm text-center text-gray-500">
                        <Link href="/auth/signin" className="text-purple-600 hover:text-purple-700 font-medium cursor-pointer">
                          Sign in
                        </Link>{" "}to request a seat
                      </p>
                    )}
                    {session && !session.user?.university && (
                      <p className="mt-3 text-sm text-center text-gray-500">
                        <Link href="/onboarding" className="text-purple-600 hover:text-purple-700 font-medium cursor-pointer">
                          Verify your university
                        </Link>{" "}to join rides
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
