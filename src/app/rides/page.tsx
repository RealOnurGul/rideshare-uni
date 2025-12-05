"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import RidesMap from "@/components/rides-map";

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
  driver: Driver;
}

export default function RidesPage() {
  const { data: session } = useSession();
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedRideId, setSelectedRideId] = useState<string | undefined>();
  const [filters, setFilters] = useState({
    origin: "",
    destination: "",
    dateFrom: "",
    dateTo: "",
    university: "",
  });

  // Autocomplete state
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);
  const [originFocused, setOriginFocused] = useState(false);
  const [destinationFocused, setDestinationFocused] = useState(false);
  const originRef = useRef<HTMLDivElement>(null);
  const destinationRef = useRef<HTMLDivElement>(null);

  // Fetch available locations from database
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch("/api/locations");
        const data = await res.json();
        setAvailableLocations(data.locations || []);
      } catch {
        // Silently fail
      }
    };
    fetchLocations();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (originRef.current && !originRef.current.contains(e.target as Node)) {
        setOriginFocused(false);
      }
      if (destinationRef.current && !destinationRef.current.contains(e.target as Node)) {
        setDestinationFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate suggestions directly based on current filter values
  const originSuggestions = filters.origin.length > 0
    ? availableLocations.filter(loc => 
        loc.toLowerCase().includes(filters.origin.toLowerCase())
      ).slice(0, 5)
    : [];

  const destinationSuggestions = filters.destination.length > 0
    ? availableLocations.filter(loc => 
        loc.toLowerCase().includes(filters.destination.toLowerCase())
      ).slice(0, 5)
    : [];

  const selectOrigin = (value: string) => {
    setFilters({ ...filters, origin: value });
    setOriginFocused(false);
  };

  const selectDestination = (value: string) => {
    setFilters({ ...filters, destination: value });
    setDestinationFocused(false);
  };

  const fetchRides = async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (filters.origin) params.set("origin", filters.origin);
    if (filters.destination) params.set("destination", filters.destination);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);
    if (filters.university) params.set("university", filters.university);

    try {
      const res = await fetch(`/api/rides?${params.toString()}`);
      const data = await res.json();
      // Ensure data is an array before setting
      setRides(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch rides:", error);
      setRides([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRides();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRides();
  };

  const clearFilters = () => {
    setFilters({ origin: "", destination: "", dateFrom: "", dateTo: "", university: "" });
    setTimeout(fetchRides, 0);
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

  const handleRideSelect = (rideId: string) => {
    setSelectedRideId(rideId);
  };

  const hasActiveFilters = filters.origin || filters.destination || filters.dateFrom || filters.dateTo || filters.university;

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find a Ride</h1>
              <p className="text-gray-600 mt-1">Browse available rides from fellow students</p>
            </div>
            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                    viewMode === "list"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    List
                  </span>
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${
                    viewMode === "map"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    Map
                  </span>
                </button>
              </div>

              {session && (
                <Link
                  href="/rides/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Offer Ride
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {/* Origin with autocomplete */}
            <div className="col-span-1 relative" ref={originRef}>
              <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
              <input
                type="text"
                value={filters.origin}
                onChange={(e) => setFilters({ ...filters, origin: e.target.value })}
                onFocus={() => setOriginFocused(true)}
                placeholder="Origin"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm cursor-text"
              />
              {originFocused && originSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-48 overflow-auto">
                  {originSuggestions.map((loc, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectOrigin(loc)}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-900 hover:bg-purple-50 border-b border-gray-100 last:border-0 cursor-pointer transition-colors"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Destination with autocomplete */}
            <div className="col-span-1 relative" ref={destinationRef}>
              <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
              <input
                type="text"
                value={filters.destination}
                onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
                onFocus={() => setDestinationFocused(true)}
                placeholder="Destination"
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm cursor-text"
              />
              {destinationFocused && destinationSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-48 overflow-auto">
                  {destinationSuggestions.map((loc, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => selectDestination(loc)}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-900 hover:bg-purple-50 border-b border-gray-100 last:border-0 cursor-pointer transition-colors"
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm cursor-pointer"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                min={filters.dateFrom || undefined}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm cursor-pointer"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">University</label>
              <select
                value={filters.university}
                onChange={(e) => setFilters({ ...filters, university: e.target.value })}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm cursor-pointer"
              >
                <option value="">All</option>
                <option value="McGill">McGill</option>
                <option value="Concordia">Concordia</option>
                <option value="Montréal">UdeM</option>
              </select>
            </div>
            <div className="col-span-1 flex items-end">
              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors text-sm cursor-pointer"
              >
                Search
              </button>
            </div>
            <div className="col-span-1 flex items-end">
              <button
                type="button"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Clear
              </button>
            </div>
          </div>
        </form>

        {/* Map View */}
        {viewMode === "map" && (
          <div className="mb-8 animate-fade-in">
            <RidesMap
              rides={rides}
              onRideSelect={handleRideSelect}
              selectedRideId={selectedRideId}
            />
            {selectedRideId && (
              <div className="mt-4">
                {rides.filter(r => r.id === selectedRideId).map(ride => (
                  <Link
                    key={ride.id}
                    href={`/rides/${ride.id}`}
                    className="block bg-white rounded-xl p-5 shadow-sm border-2 border-purple-500 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                          {ride.origin}
                          <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                          {ride.destination}
                        </div>
                        <p className="text-gray-600 text-sm mt-1">
                          {formatDate(ride.dateTime)} at {formatTime(ride.dateTime)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">${ride.pricePerSeat}</div>
                        <p className="text-gray-500 text-sm">{ride.seatsAvailable} seats</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <>
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-600 border-t-transparent"></div>
              </div>
            ) : rides.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200 text-center">
                <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No rides found</h3>
                <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                  {hasActiveFilters
                    ? "Try adjusting your filters or check back later."
                    : "Be the first to offer a ride to fellow students!"}
                </p>
                {session && (
                  <Link
                    href="/rides/new"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Offer a Ride
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">{rides.length} ride{rides.length !== 1 ? 's' : ''} available</p>
                {rides.map((ride, index) => (
                  <div
                    key={ride.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Link
                      href={`/rides/${ride.id}`}
                      className="block bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Route Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-purple-600"></div>
                              <span className="text-lg font-semibold text-gray-900">{ride.origin}</span>
                            </div>
                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full bg-purple-400"></div>
                              <span className="text-lg font-semibold text-gray-900">{ride.destination}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1.5">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {formatDate(ride.dateTime)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatTime(ride.dateTime)}
                            </span>
                          </div>
                        </div>

                        {/* Driver Info */}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            {ride.driver.image ? (
                              <img
                                src={ride.driver.image}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <span className="text-purple-600 font-semibold">
                                  {ride.driver.name?.[0] || "D"}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {ride.driver.name || "Driver"}
                              </p>
                              <p className="text-xs text-gray-500">{ride.driver.university}</p>
                            </div>
                          </div>

                          <div className="h-10 w-px bg-gray-200 hidden lg:block"></div>

                          <div className="text-center px-3">
                            <span className="inline-flex items-center px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                              {ride.seatsAvailable} seat{ride.seatsAvailable !== 1 ? 's' : ''}
                            </span>
                          </div>

                          <div className="h-10 w-px bg-gray-200 hidden lg:block"></div>

                          <div className="text-right min-w-[80px]">
                            <div className="text-2xl font-bold text-gray-900">${ride.pricePerSeat}</div>
                            <div className="text-xs text-gray-500">per seat</div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
