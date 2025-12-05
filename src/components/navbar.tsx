"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import NotificationBell from "./notification-bell";

export function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-gray-900">StudentRide</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/rides"
              className="text-gray-600 hover:text-purple-600 transition-colors font-medium cursor-pointer"
            >
              Find Rides
            </Link>
            {status === "authenticated" && (
              <>
                <Link
                  href="/rides/new"
                  className="text-gray-600 hover:text-purple-600 transition-colors font-medium cursor-pointer"
                >
                  Offer a Ride
                </Link>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-purple-600 transition-colors font-medium cursor-pointer"
                >
                  Dashboard
                </Link>
                <Link
                  href="/chats"
                  className="text-gray-600 hover:text-purple-600 transition-colors font-medium cursor-pointer flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Chats
                </Link>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {status === "authenticated" ? (
              <div className="flex items-center gap-3">
                <NotificationBell />
                <Link href="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
                  {session.user?.image ? (
                    <img 
                      src={session.user.image} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-purple-600 font-medium text-sm">
                        {session.user?.name?.[0] || session.user?.email?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                  <span className="text-gray-700 text-sm font-medium">
                    {session.user?.name || session.user?.email?.split("@")[0]}
                  </span>
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors cursor-pointer"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {status === "authenticated" && <NotificationBell />}
            <button
              className="text-gray-600 p-2 cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-3">
              <Link
                href="/rides"
                className="px-3 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Rides
              </Link>
              {status === "authenticated" && (
                <>
                  <Link
                    href="/rides/new"
                    className="px-3 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Offer a Ride
                  </Link>
                  <Link
                    href="/dashboard"
                    className="px-3 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/chats"
                    className="px-3 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer flex items-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Chats
                  </Link>
                  <Link
                    href="/vehicles"
                    className="px-3 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Vehicles
                  </Link>
                  <Link
                    href="/profile"
                    className="px-3 py-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              )}
              {status !== "authenticated" && (
                <Link
                  href="/auth/signin"
                  className="px-3 py-2 text-purple-600 font-medium hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Onboarding Banner */}
      {status === "authenticated" && session?.user && !session.user.university && pathname !== "/onboarding" && (
        <div className="bg-purple-600 text-white px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-sm">
              👋 Complete your profile to start using StudentRide
            </p>
            <Link
              href="/onboarding"
              className="text-sm font-medium bg-white text-purple-600 px-3 py-1 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
            >
              Complete Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
