"use client";

import { useState, useEffect } from "react";

export function DemoDisclaimer() {
  const [isVisible, setIsVisible] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100 && !hasScrolled) {
        setHasScrolled(true);
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasScrolled]);

  if (!isVisible) return null;

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 py-3 px-4 sticky top-0 z-40 transition-all duration-300">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm text-yellow-800">
          <strong>⚠️ Demo Site:</strong> This site is currently in demo mode. Most data is test data and this platform is not officially running yet. Please do not use this for actual ridesharing.
        </p>
      </div>
    </div>
  );
}

