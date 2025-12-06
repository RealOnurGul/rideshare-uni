"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Driver {
  id: string;
  name: string | null;
  image: string | null;
}

interface Ride {
  id: string;
  origin: string;
  destination: string;
  dateTime: string;
  pricePerSeat: number;
  driver: Driver;
}

interface BookingDetails {
  id: string;
  status: string;
  confirmedAt: string | null;
  paymentAmount: number | null;
  ride: Ride;
}

export default function ConfirmRidePage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const { bookingId } = use(params);
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Rating state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (sessionStatus === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        if (!res.ok) {
          setError("Booking not found");
          return;
        }
        const data = await res.json();
        
        // Check if already confirmed
        if (data.confirmedAt) {
          setError("This ride has already been confirmed");
          return;
        }
        
        // Check if booking is accepted
        if (data.status !== "accepted") {
          setError("Only accepted bookings can be confirmed");
          return;
        }
        
        // Check if ride is completed (driver marked it complete) OR ride time has passed
        if (data.ride.status !== "completed" && new Date(data.ride.dateTime) > new Date()) {
          setError("You can only confirm after the driver marks the ride as complete or after the ride has started");
          return;
        }
        
        setBooking(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load booking");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, sessionStatus, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      setError("Please select a rating for your driver");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/bookings/${bookingId}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to confirm ride");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm ride");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-CA", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Unable to Confirm</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/dashboard" className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors cursor-pointer">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Ride Confirmed!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for confirming your ride. The driver has been notified and payment has been released.
          </p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Confirm Your Ride</h1>
          <p className="text-gray-600">
            Rate your experience and release the payment to the driver
          </p>
        </div>

        {/* Ride Summary */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/users/${booking.ride.driver.id}`} className="cursor-pointer">
              {booking.ride.driver.image ? (
                <img
                  src={booking.ride.driver.image}
                  alt=""
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-xl">
                    {booking.ride.driver.name?.[0] || "?"}
                  </span>
                </div>
              )}
            </Link>
            <div>
              <Link href={`/users/${booking.ride.driver.id}`} className="font-semibold text-gray-900 hover:text-purple-600 cursor-pointer">
                {booking.ride.driver.name || "Driver"}
              </Link>
              <p className="text-sm text-gray-500">{formatDate(booking.ride.dateTime)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-600"></div>
              <span className="font-medium">{booking.ride.origin.split(",")[0]}</span>
            </div>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-400"></div>
              <span className="font-medium">{booking.ride.destination.split(",")[0]}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-gray-600">Amount paid</span>
            <span className="font-bold text-lg text-purple-600">
              ${booking.paymentAmount?.toFixed(2) || booking.ride.pricePerSeat.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Rating Form */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-center">
              How was your ride with {booking.ride.driver.name?.split(" ")[0] || "the driver"}?
            </h3>

            {/* Star Rating */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                >
                  <svg
                    className={`w-10 h-10 ${
                      star <= (hoverRating || rating)
                        ? "text-yellow-400"
                        : "text-gray-300"
                    } transition-colors`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>

            <p className="text-center text-gray-500 mb-4">
              {rating === 0 && "Tap a star to rate"}
              {rating === 1 && "Poor experience"}
              {rating === 2 && "Below average"}
              {rating === 3 && "Average"}
              {rating === 4 && "Good experience"}
              {rating === 5 && "Excellent experience!"}
            </p>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leave a comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Share your experience..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center mb-4">{error}</p>
          )}

          {/* Payment Info */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-purple-700">
                By confirming, you acknowledge the ride was completed successfully and the payment of{" "}
                <span className="font-semibold">${booking.paymentAmount?.toFixed(2) || booking.ride.pricePerSeat.toFixed(2)}</span>{" "}
                will be released to the driver.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || rating === 0}
            className="w-full py-4 px-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Confirm Ride & Release Payment
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

