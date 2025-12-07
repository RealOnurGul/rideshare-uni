"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import NotificationBell from "./notification-bell";

export function Navbar() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return pathname === path;
    }
    return pathname?.startsWith(path);
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "glass border-b border-white/20 shadow-lg backdrop-blur-xl" 
          : "bg-white/80 backdrop-blur-sm border-b border-gray-100"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                StudentRide
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              <div className="relative group">
                <Link
                  href="/how-it-works"
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    pathname?.startsWith("/how-it-works")
                      ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700"
                      : "text-gray-700 hover:bg-gray-100"
                  } cursor-pointer`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  How it works
                  <svg className="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>
                <div className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                  <div className="p-2">
                    {[
                      { href: "/how-it-works/drivers", label: "For drivers", icon: "🚗" },
                      { href: "/how-it-works/passengers", label: "For passengers", icon: "👥" },
                      { href: "/how-it-works/students", label: "For students", icon: "🎓" },
                      { href: "/how-it-works/trust-safety", label: "Trust & Safety", icon: "🛡️" },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 group/item cursor-pointer"
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-gray-700 font-medium group-hover/item:text-indigo-700">{item.label}</span>
                        <svg className="w-4 h-4 text-gray-400 ml-auto group-hover/item:text-indigo-600 group-hover/item:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              
              <Link
                href="/rides"
                className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive("/rides") && !pathname?.startsWith("/rides/new")
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-100"
                } cursor-pointer`}
              >
                Find Rides
              </Link>
              
              {status === "authenticated" && (
                <>
                  <Link
                    href="/rides/new"
                    className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                      isActive("/rides/new", true)
                        ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700"
                        : "text-gray-700 hover:bg-gray-100"
                    } cursor-pointer`}
                  >
                    Offer a Ride
                  </Link>
                  <Link
                    href="/dashboard"
                    className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                      isActive("/dashboard")
                        ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700"
                        : "text-gray-700 hover:bg-gray-100"
                    } cursor-pointer`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/chats"
                    className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 relative ${
                      isActive("/chats")
                        ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700"
                        : "text-gray-700 hover:bg-gray-100"
                    } cursor-pointer`}
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Chats
                    </span>
                  </Link>
                </>
              )}
            </div>

            {/* Right Side */}
            <div className="hidden lg:flex items-center gap-3">
              {status === "authenticated" ? (
                <>
                  <NotificationBell />
                  <Link 
                    href="/profile" 
                    className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group cursor-pointer"
                  >
                    {session.user?.image ? (
                      <img 
                        src={session.user.image} 
                        alt="Profile" 
                        className="w-9 h-9 rounded-xl object-cover ring-2 ring-gray-200 group-hover:ring-indigo-300 transition-all"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center ring-2 ring-gray-200 group-hover:ring-indigo-300 transition-all">
                        <span className="text-white font-semibold text-sm">
                          {session.user?.name?.[0] || session.user?.email?.[0]?.toUpperCase() || "U"}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900">
                        {session.user?.name || session.user?.email?.split("@")[0]}
                      </span>
                      <span className="text-xs text-gray-500">{session.user?.university || "Student"}</span>
                    </div>
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signin"
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center gap-2">
              {status === "authenticated" && <NotificationBell />}
              <button
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6 text-gray-700"
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
        </div>

        {/* Mobile Navigation */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${
          isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}>
          <div className="px-4 pb-6 pt-2 border-t border-gray-100 bg-white/95 backdrop-blur-xl">
            <div className="flex flex-col gap-2">
              <Link
                href="/how-it-works"
                className="px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                How it works
              </Link>
              <Link
                href="/rides"
                className="px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all cursor-pointer"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Rides
              </Link>
              {status === "authenticated" && (
                <>
                  <Link
                    href="/rides/new"
                    className="px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Offer a Ride
                  </Link>
                  <Link
                    href="/dashboard"
                    className="px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/chats"
                    className="px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all cursor-pointer flex items-center gap-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Chats
                  </Link>
                  <Link
                    href="/vehicles"
                    className="px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Vehicles
                  </Link>
                  <Link
                    href="/profile"
                    className="px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all cursor-pointer"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: "/" });
                      setIsMenuOpen(false);
                    }}
                    className="px-4 py-3 text-left rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                  >
                    Sign Out
                  </button>
                </>
              )}
              {status !== "authenticated" && (
                <Link
                  href="/auth/signin"
                  className="px-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 text-center transition-all cursor-pointer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Spacer for fixed navbar */}
      <div className="h-20"></div>
      
      {/* Onboarding Banner */}
      {status === "authenticated" && session?.user && !session.user.university && pathname !== "/onboarding" && (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium flex items-center gap-2">
                <span className="text-lg">👋</span>
                Complete your profile to start using StudentRide
              </p>
              <Link
                href="/onboarding"
                className="text-sm font-semibold bg-white text-indigo-600 px-4 py-1.5 rounded-lg hover:bg-gray-50 transition-all cursor-pointer shadow-lg"
              >
                Complete Profile
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
