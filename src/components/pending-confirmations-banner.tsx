"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface PendingBooking {
  id: string;
  ride: {
    id: string;
    origin: string;
    destination: string;
    dateTime: string;
    driver: {
      name: string | null;
    };
  };
}

export function PendingConfirmationsBanner() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [pendingBookings, setPendingBookings] = useState<PendingBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchPendingConfirmations = async () => {
      try {
        const res = await fetch("/api/bookings/pending-confirmation");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setPendingBookings(data);
          }
        }
      } catch (error) {
        console.error("Error fetching pending confirmations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingConfirmations();
    // Refresh every 5 minutes
    const interval = setInterval(fetchPendingConfirmations, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Don't show on confirmation page itself
  if (pathname?.startsWith("/confirm-ride")) return null;
  if (isLoading || pendingBookings.length === 0) return null;

  const booking = pendingBookings[0]; // Show the most recent one

  return (
    <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-sm">
            <span className="font-medium">Confirm your ride!</span>
            <span className="ml-1 opacity-90">
              {booking.ride.origin.split(",")[0]} → {booking.ride.destination.split(",")[0]}
            </span>
            {pendingBookings.length > 1 && (
              <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                +{pendingBookings.length - 1} more
              </span>
            )}
          </div>
        </div>
        <Link
          href={`/confirm-ride/${booking.id}`}
          className="px-4 py-1.5 bg-white text-orange-600 text-sm font-medium rounded-lg hover:bg-orange-50 transition-colors cursor-pointer flex-shrink-0"
        >
          Confirm & Rate
        </Link>
      </div>
    </div>
  );
}


