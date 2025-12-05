"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    province?: string;
    country?: string;
  };
}

interface MapPickerProps {
  onOriginChange: (location: Location | null) => void;
  onDestinationChange: (location: Location | null) => void;
  origin: Location | null;
  destination: Location | null;
}

// Simple location search component
function LocationSearch({
  label,
  color,
  value,
  onChange,
  isActive,
  onFocus,
}: {
  label: string;
  color: string;
  value: Location | null;
  onChange: (loc: Location | null) => void;
  isActive: boolean;
  onFocus: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search function - simple and direct
  const searchPlaces = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      // Simple search - Canada only
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("format", "json");
      url.searchParams.set("q", searchQuery);
      url.searchParams.set("countrycodes", "ca"); // Canada only
      url.searchParams.set("limit", "6");
      url.searchParams.set("addressdetails", "1");

      const response = await fetch(url.toString(), {
        headers: { "Accept-Language": "en" },
      });
      const data: NominatimResult[] = await response.json();
      
      setResults(data);
      setShowResults(data.length > 0);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  const handleInputChange = (value: string) => {
    setQuery(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => searchPlaces(value), 300);
  };

  // Format display name from result
  const formatResult = (result: NominatimResult) => {
    const addr = result.address;
    if (!addr) {
      const parts = result.display_name.split(",");
      return { main: parts[0], sub: parts.slice(1, 3).join(",") };
    }

    const city = addr.city || addr.town || addr.village || addr.municipality;
    const state = addr.state || addr.province;
    const road = addr.road;
    const houseNum = addr.house_number;

    if (road) {
      const street = houseNum ? `${houseNum} ${road}` : road;
      return { main: street, sub: [city, state, addr.country].filter(Boolean).join(", ") };
    }
    if (city) {
      return { main: city, sub: [state, addr.country].filter(Boolean).join(", ") };
    }
    if (state) {
      return { main: state, sub: addr.country || "" };
    }
    
    const parts = result.display_name.split(",");
    return { main: parts[0], sub: parts.slice(1, 3).join(",") };
  };

  // Build full address string
  const buildAddress = (result: NominatimResult) => {
    const addr = result.address;
    if (!addr) return result.display_name.split(",").slice(0, 4).join(", ");

    const parts = [];
    if (addr.house_number && addr.road) parts.push(`${addr.house_number} ${addr.road}`);
    else if (addr.road) parts.push(addr.road);
    
    const city = addr.city || addr.town || addr.village || addr.municipality;
    if (city) parts.push(city);
    
    const state = addr.state || addr.province;
    if (state) parts.push(state);
    
    if (addr.country) parts.push(addr.country);

    return parts.join(", ");
  };

  // Select a result
  const selectResult = (result: NominatimResult) => {
    const address = buildAddress(result);
    onChange({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address,
    });
    setQuery(address);
    setShowResults(false);
    setResults([]);
  };

  // Clear selection
  const clearSelection = () => {
    onChange(null);
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div
      ref={containerRef}
      className={`p-4 rounded-2xl border-2 transition-all ${
        isActive ? "border-purple-400 bg-purple-50/50" : "border-gray-200 bg-white"
      }`}
      onClick={onFocus}
    >
      {/* Label */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3.5 h-3.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="font-bold text-gray-900">{label}</span>
        </div>
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              clearSelection();
            }}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              onFocus();
              if (results.length > 0) setShowResults(true);
            }}
            placeholder="Search any Canadian city or address..."
            className="w-full px-4 py-4 pr-12 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
          />
          {isSearching ? (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg className="animate-spin h-5 w-5 text-purple-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          )}
        </div>

        {/* Results Dropdown */}
        {showResults && results.length > 0 && (
          <div className="absolute z-[9999] left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden max-h-80 overflow-y-auto">
            {results.map((result) => {
              const { main, sub } = formatResult(result);
              return (
                <button
                  key={result.place_id}
                  type="button"
                  onClick={() => selectResult(result)}
                  className="w-full px-5 py-4 text-left hover:bg-purple-50 transition-colors cursor-pointer border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-start gap-4">
                    <svg className="w-6 h-6 text-purple-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 text-base">{main}</div>
                      <div className="text-sm text-gray-500 mt-0.5">{sub}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Location Confirmation */}
      {value && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-base text-green-800 font-medium">{value.address}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// Main Map Picker Component
function MapPickerInner({
  onOriginChange,
  onDestinationChange,
  origin,
  destination,
}: MapPickerProps) {
  const [leafletReady, setLeafletReady] = useState(false);
  const [activePanel, setActivePanel] = useState<"origin" | "destination">("origin");
  const leafletRef = useRef<{
    L: typeof import("leaflet");
    MapContainer: typeof import("react-leaflet").MapContainer;
    TileLayer: typeof import("react-leaflet").TileLayer;
    Marker: typeof import("react-leaflet").Marker;
    Polyline: typeof import("react-leaflet").Polyline;
    useMap: typeof import("react-leaflet").useMap;
  } | null>(null);

  // Load Leaflet
  useEffect(() => {
    const loadLeaflet = async () => {
      const L = (await import("leaflet")).default;
      const { MapContainer, TileLayer, Marker, Polyline, useMap } = await import("react-leaflet");
      leafletRef.current = { L, MapContainer, TileLayer, Marker, Polyline, useMap };
      setLeafletReady(true);
    };
    loadLeaflet();
  }, []);

  if (!leafletReady || !leafletRef.current) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  const { L, MapContainer, TileLayer, Marker, Polyline, useMap } = leafletRef.current;

  // Create custom pin icon
  const createPinIcon = (type: "origin" | "destination") => {
    return L.divIcon({
      className: "custom-pin",
      html: `
        <div style="
          width: 30px;
          height: 30px;
          background: ${type === "origin" ? "#9333ea" : "#7c3aed"};
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });
  };

  // Map controller component - fits both points or flies to single point
  function MapController({ 
    origin, 
    destination 
  }: { 
    origin: Location | null; 
    destination: Location | null;
  }) {
    const map = useMap();
    
    useEffect(() => {
      // Small delay for smoother feel
      const timeout = setTimeout(() => {
        if (origin && destination) {
          // Both locations selected - fit bounds to show both with padding
          const bounds = L.latLngBounds(
            [origin.lat, origin.lng],
            [destination.lat, destination.lng]
          );
          map.flyToBounds(bounds, { 
            padding: [60, 60],
            maxZoom: 12,
            duration: 1.8,
            easeLinearity: 0.25
          });
        } else if (origin) {
          map.flyTo([origin.lat, origin.lng], 13, { 
            duration: 1.5,
            easeLinearity: 0.25
          });
        } else if (destination) {
          map.flyTo([destination.lat, destination.lng], 13, { 
            duration: 1.5,
            easeLinearity: 0.25
          });
        }
      }, 100);
      
      return () => clearTimeout(timeout);
    }, [origin, destination, map]);
    
    return null;
  }

  // Reverse geocode for drag
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
      const res = await fetch(url);
      const data = await res.json();
      
      const addr = data.address;
      if (!addr) return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

      const parts = [];
      if (addr.house_number && addr.road) parts.push(`${addr.house_number} ${addr.road}`);
      else if (addr.road) parts.push(addr.road);
      
      const city = addr.city || addr.town || addr.village || addr.municipality;
      if (city) parts.push(city);
      if (addr.state || addr.province) parts.push(addr.state || addr.province);
      if (addr.country) parts.push(addr.country);

      return parts.join(", ");
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  };

  const defaultCenter: [number, number] = [45.5017, -73.5673]; // Montreal

  return (
    <div className="space-y-4">
      {/* Search Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LocationSearch
          label="Pickup Location"
          color="#9333ea"
          value={origin}
          onChange={onOriginChange}
          isActive={activePanel === "origin"}
          onFocus={() => setActivePanel("origin")}
        />
        <LocationSearch
          label="Dropoff Location"
          color="#7c3aed"
          value={destination}
          onChange={onDestinationChange}
          isActive={activePanel === "destination"}
          onFocus={() => setActivePanel("destination")}
        />
      </div>

      {/* Map */}
      <div className="relative rounded-xl overflow-hidden border border-gray-200">
        <MapContainer
          center={defaultCenter}
          zoom={10}
          style={{ height: "280px", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController origin={origin} destination={destination} />

          {origin && (
            <Marker
              position={[origin.lat, origin.lng]}
              icon={createPinIcon("origin")}
              draggable
              eventHandlers={{
                dragend: async (e) => {
                  const pos = e.target.getLatLng();
                  const address = await reverseGeocode(pos.lat, pos.lng);
                  onOriginChange({ lat: pos.lat, lng: pos.lng, address });
                },
              }}
            />
          )}

          {destination && (
            <Marker
              position={[destination.lat, destination.lng]}
              icon={createPinIcon("destination")}
              draggable
              eventHandlers={{
                dragend: async (e) => {
                  const pos = e.target.getLatLng();
                  const address = await reverseGeocode(pos.lat, pos.lng);
                  onDestinationChange({ lat: pos.lat, lng: pos.lng, address });
                },
              }}
            />
          )}

          {origin && destination && (
            <Polyline
              positions={[
                [origin.lat, origin.lng],
                [destination.lat, destination.lng],
              ]}
              pathOptions={{ color: "#9333ea", weight: 3, dashArray: "10, 10" }}
            />
          )}
        </MapContainer>

        {/* Drag hint */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md text-xs text-gray-600 flex items-center gap-2">
          <span>💡</span>
          <span>Drag pins on map to fine-tune location</span>
        </div>
      </div>

      {/* Route Summary */}
      {(origin || destination) && (
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
          <div className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-3">
            Your Route
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-purple-600" />
              <div className="w-0.5 flex-1 bg-purple-300 my-1 min-h-[20px]" />
              <div className="w-3 h-3 rounded-full bg-violet-500" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <div className="text-xs font-semibold text-purple-600 mb-0.5">FROM</div>
                <div className="text-sm text-gray-900">
                  {origin ? origin.address : <span className="text-gray-400">Search for pickup location</span>}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-violet-600 mb-0.5">TO</div>
                <div className="text-sm text-gray-900">
                  {destination ? destination.address : <span className="text-gray-400">Search for dropoff location</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Export with dynamic import (no SSR)
const MapPicker = dynamic(() => Promise.resolve(MapPickerInner), {
  ssr: false,
  loading: () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
      </div>
      <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
    </div>
  ),
});

export default MapPicker;
