"use client";

import { useState, useEffect } from "react";

interface ReviewCountdownProps {
  completedAt: string; // When the ride was marked complete
}

export function ReviewCountdown({ completedAt }: ReviewCountdownProps) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const completed = new Date(completedAt).getTime();
      const now = Date.now();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      const elapsed = now - completed;
      const remaining = twentyFourHours - elapsed;

      if (remaining <= 0) {
        setExpired(true);
        setTimeRemaining(0);
      } else {
        setExpired(false);
        setTimeRemaining(remaining);
      }
    };

    calculateTimeRemaining();
    // Update every minute since we're only showing hours and minutes
    const interval = setInterval(calculateTimeRemaining, 60000);

    return () => clearInterval(interval);
  }, [completedAt]);

  if (expired || timeRemaining === null || timeRemaining === 0) {
    return (
      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
        Review period expired
      </span>
    );
  }

  const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200">
      ⏱️ {hours}h {minutes}m left to review
    </span>
  );
}

