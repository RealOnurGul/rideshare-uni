"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
    postcode?: string;
  };
}

interface RouteInfo {
  distance: number; // in meters
  duration: number; // in seconds
  geometry: [number, number][]; // decoded polyline coordinates
}

interface MapPickerProps {
  onOriginChange: (location: Location | null) => void;
  onDestinationChange: (location: Location | null) => void;
  origin: Location | null;
  destination: Location | null;
}

// Improved address formatting function
function formatAddress(result: NominatimResult): string {
  const addr = result.address;
  const displayName = result.display_name || "";
  
  if (!addr) {
    // Fallback to display_name, but clean it up
    const parts = displayName.split(",").map(p => p.trim());
    // Remove duplicates and country if it's Canada
    const filtered = parts.filter((p, i) => {
      if (p === "Canada" && i === parts.length - 1) return false;
      if (i > 0 && p === parts[i - 1]) return false;
      return true;
    });
    return filtered.slice(0, 4).join(", ");
  }

  const parts: string[] = [];
  
  // Street address
  if (addr.house_number && addr.road) {
    parts.push(`${addr.house_number} ${addr.road}`);
  } else if (addr.road) {
    parts.push(addr.road);
  }
  
  // City - extract from display_name first for better accuracy, then fallback to address fields
  // The display_name often has the full city name (e.g., "Quebec City" vs just "Quebec")
  let city = addr.city || addr.town || addr.village || addr.municipality;
  
  // Extract city name from display_name - it's usually more accurate
  // Look for city name in display_name that matches or is more complete than address.city
  if (displayName && city) {
    // Split display_name and find the part that contains the city
    const displayParts = displayName.split(",").map(p => p.trim());
    
    // Find the part that matches or contains the city name
    for (const part of displayParts) {
      // Check if this part contains the city name (case-insensitive)
      const lowerPart = part.toLowerCase();
      const lowerCity = city.toLowerCase();
      
      // If display_name part contains the city name and is longer/more complete, use it
      if (lowerPart.includes(lowerCity) && part.length > city.length) {
        city = part;
        break;
      }
      // Also check if city name is a substring of the display part (e.g., "Quebec" in "Quebec City")
      if (lowerCity.length < lowerPart.length && lowerPart.includes(lowerCity)) {
        // Use the display_name part if it seems like a city name (not too long, not a province)
        if (part.length < 50 && !part.match(/^(Quebec|Ontario|British Columbia|Alberta|Manitoba|Saskatchewan|Nova Scotia|New Brunswick|Newfoundland|Prince Edward Island|Yukon|Northwest Territories|Nunavut)$/i)) {
          city = part;
          break;
        }
      }
    }
  }
  
  // If we still don't have a city, try to extract from display_name
  if (!city && displayName) {
    const displayParts = displayName.split(",").map(p => p.trim());
    // Usually the city is one of the first few parts (before province/state)
    for (let i = 0; i < Math.min(3, displayParts.length); i++) {
      const part = displayParts[i];
      // Skip if it looks like a street address, province, or country
      if (!part.match(/^\d+/) && 
          !part.match(/^(Quebec|Ontario|British Columbia|Alberta|Manitoba|Saskatchewan|Nova Scotia|New Brunswick|Newfoundland|Prince Edward Island|Yukon|Northwest Territories|Nunavut|Canada)$/i)) {
        city = part;
        break;
      }
    }
  }
  
  if (city) {
    parts.push(city);
  }
  
  // Province/State - only add if different from city
  const province = addr.state || addr.province;
  if (province && city && province !== city) {
    // Don't add if city already contains the province name
    const cityLower = city.toLowerCase();
    const provinceLower = province.toLowerCase();
    if (!cityLower.includes(provinceLower) && !provinceLower.includes(cityLower)) {
      parts.push(province);
    }
  } else if (province && !city) {
    // If no city but we have province, add it
    parts.push(province);
  }
  
  // Postal code (optional, but nice to have)
  if (addr.postcode) {
    parts.push(addr.postcode);
  }

  return parts.length > 0 ? parts.join(", ") : displayName.split(",").slice(0, 3).join(", ");
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

  // Initialize query with address if value exists
  useEffect(() => {
    if (value && !query) {
      setQuery(value.address);
    }
  }, [value]);

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

  // Search function - improved with better query handling
  const searchPlaces = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("format", "json");
      url.searchParams.set("q", searchQuery);
      url.searchParams.set("countrycodes", "ca"); // Canada only
      url.searchParams.set("limit", "8");
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("extratags", "1"); // Get more details

      const response = await fetch(url.toString(), {
        headers: { 
          "Accept-Language": "en",
          "User-Agent": "StudentRide/1.0" // Required by Nominatim
        },
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

  // Format display name from result - improved to use display_name for accurate city names
  const formatResult = (result: NominatimResult) => {
    const addr = result.address;
    const displayName = result.display_name || "";
    
    if (!addr) {
      const parts = displayName.split(",").map(p => p.trim());
      return { main: parts[0], sub: parts.slice(1, 3).join(", ") };
    }

    const road = addr.road;
    const houseNum = addr.house_number;
    const province = addr.state || addr.province;
    
    // Get city from address fields first
    let city = addr.city || addr.town || addr.village || addr.municipality;
    
    // Extract better city name from display_name - prioritize display_name parsing
    if (displayName) {
      const displayParts = displayName.split(",").map(p => p.trim());
      
      // First, check for specific patterns like "Quebec City" in display_name
      if (displayName.includes("Quebec City")) {
        city = "Quebec City";
      } else if (displayName.includes("Ville de Québec") || displayName.includes("Québec")) {
        // Check if it's Quebec City (not just the province)
        const quebecCityMatch = displayName.match(/(Ville de Québec|Québec)/);
        if (quebecCityMatch) {
          city = quebecCityMatch[1] === "Ville de Québec" ? "Quebec City" : "Quebec City";
        }
      } else {
        // Common pattern: "City Name, Province, Country" or "Street, City Name, Province"
        // The city is usually the first part that's not a street address and not a province
        const provinces = ["Quebec", "Ontario", "British Columbia", "Alberta", "Manitoba", "Saskatchewan", 
                          "Nova Scotia", "New Brunswick", "Newfoundland", "Prince Edward Island", 
                          "Yukon", "Northwest Territories", "Nunavut", "Canada"];
        
        // Look for city name in display_name - it's usually before the province
        for (let i = 0; i < displayParts.length; i++) {
          const part = displayParts[i];
          const lowerPart = part.toLowerCase();
          
          // Skip if it's a province, country, or street address
          if (provinces.some(p => p.toLowerCase() === lowerPart)) continue;
          if (lowerPart === "canada") continue;
          if (part.match(/^\d+/)) continue; // Street number
          
          // If we have a city from address, check if this part contains it but is more complete
          if (city) {
            const lowerCity = city.toLowerCase();
            // If this part contains the city name and is longer, use it
            if (lowerPart.includes(lowerCity) && part.length > city.length) {
              city = part;
              break;
            }
            // If city is a substring of this part (e.g., "Quebec" in "Quebec City")
            if (lowerCity.length < lowerPart.length && lowerPart.includes(lowerCity)) {
              city = part;
              break;
            }
          } else {
            // No city from address, use this part as city if it looks like a city name
            if (part.length > 0 && part.length < 50 && !part.match(/^\d+/)) {
              city = part;
              break;
            }
          }
        }
      }
    }

    if (road) {
      const street = houseNum ? `${houseNum} ${road}` : road;
      // Only show province if it's different from city
      const subParts = city && province && city !== province ? [city, province].filter(Boolean) : [province].filter(Boolean);
      return { main: street, sub: subParts.join(", ") };
    }
    if (city) {
      // Only show province if it's different from city
      return { main: city, sub: province && province !== city ? province : "" };
    }
    if (province) {
      return { main: province, sub: "" };
    }
    
    const parts = displayName.split(",").map(p => p.trim());
    return { main: parts[0], sub: parts.slice(1, 2).join(", ") };
  };

  // Select a result
  const selectResult = (result: NominatimResult) => {
    const address = formatAddress(result);
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
        isActive ? "border-[#5140BF] bg-[#5140BF]/5" : "border-gray-200 bg-white"
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
            className="w-full px-4 py-4 pr-12 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5140BF] focus:border-transparent text-base"
          />
          {isSearching ? (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg className="animate-spin h-5 w-5 text-[#5140BF]" fill="none" viewBox="0 0 24 24">
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
                  className="w-full px-5 py-4 text-left hover:bg-[#5140BF]/5 transition-colors cursor-pointer border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-start gap-4">
                    <svg className="w-6 h-6 text-[#5140BF] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 text-base">{main}</div>
                      {sub && <div className="text-sm text-gray-500 mt-0.5">{sub}</div>}
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
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
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

  // Decode polyline (OSRM returns encoded polyline)
  const decodePolyline = (encoded: string): [number, number][] => {
    const coordinates: [number, number][] = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) !== 0) ? ~(result >> 1) : (result >> 1);
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) !== 0) ? ~(result >> 1) : (result >> 1);
      lng += dlng;

      coordinates.push([lat * 1e-5, lng * 1e-5]);
    }

    return coordinates;
  };

  // Calculate route using OSRM (free and open source)
  const calculateRoute = useCallback(async (origin: Location, destination: Location) => {
    setIsCalculatingRoute(true);
    try {
      // Using OSRM demo server (free, no API key needed)
      // Format: /route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=geojson
      const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // OSRM returns GeoJSON coordinates as [lng, lat], convert to [lat, lng] for Leaflet
        const geometry = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
        
        setRouteInfo({
          distance: route.distance,
          duration: route.duration,
          geometry,
        });
      } else {
        console.warn("OSRM route calculation failed, using straight line");
        // Fallback to straight line if routing fails
        const straightLineDistance = Math.sqrt(
          Math.pow((destination.lat - origin.lat) * 111000, 2) + 
          Math.pow((destination.lng - origin.lng) * 111000 * Math.cos(origin.lat * Math.PI / 180), 2)
        );
        const estimatedDuration = straightLineDistance / 1000 / 80 * 3600; // Assume 80 km/h average
        
        setRouteInfo({
          distance: straightLineDistance,
          duration: estimatedDuration,
          geometry: [[origin.lat, origin.lng], [destination.lat, destination.lng]],
        });
      }
    } catch (error) {
      console.error("Route calculation error:", error);
      // Fallback to straight line with estimated distance/duration
      const straightLineDistance = Math.sqrt(
        Math.pow((destination.lat - origin.lat) * 111000, 2) + 
        Math.pow((destination.lng - origin.lng) * 111000 * Math.cos(origin.lat * Math.PI / 180), 2)
      );
      const estimatedDuration = straightLineDistance / 1000 / 80 * 3600; // Assume 80 km/h average
      
      setRouteInfo({
        distance: straightLineDistance,
        duration: estimatedDuration,
        geometry: [[origin.lat, origin.lng], [destination.lat, destination.lng]],
      });
    } finally {
      setIsCalculatingRoute(false);
    }
  }, []);

  // Calculate route when both locations are set
  useEffect(() => {
    if (origin && destination) {
      calculateRoute(origin, destination);
    } else {
      setRouteInfo(null);
    }
  }, [origin, destination, calculateRoute]);

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

  // Create custom pin icon with purple color
  const createPinIcon = (type: "origin" | "destination") => {
    return L.divIcon({
      className: "custom-pin",
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: #5140BF;
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 3px 10px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
  };

  // Map controller component - fits both points with route
  function MapController({ 
    origin, 
    destination,
    routeGeometry
  }: { 
    origin: Location | null; 
    destination: Location | null;
    routeGeometry: [number, number][] | null;
  }) {
    const map = useMap();
    
    useEffect(() => {
      const timeout = setTimeout(() => {
        if (origin && destination) {
          // Create bounds from route geometry if available, otherwise use points
          let bounds: L.LatLngBounds;
          if (routeGeometry && routeGeometry.length > 0) {
            bounds = L.latLngBounds(routeGeometry);
          } else {
            bounds = L.latLngBounds(
              [origin.lat, origin.lng],
              [destination.lat, destination.lng]
            );
          }
          
          map.flyToBounds(bounds, { 
            padding: [80, 80],
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
    }, [origin, destination, routeGeometry, map]);
    
    return null;
  }

  // Reverse geocode for drag - improved
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
      const res = await fetch(url, {
        headers: { "User-Agent": "StudentRide/1.0" }
      });
      const data = await res.json();
      
      const addr = data.address;
      if (!addr) return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

      const parts: string[] = [];
      if (addr.house_number && addr.road) parts.push(`${addr.house_number} ${addr.road}`);
      else if (addr.road) parts.push(addr.road);
      
      const city = addr.city || addr.town || addr.village || addr.municipality;
      if (city) parts.push(city);
      
      const province = addr.state || addr.province;
      if (province && province !== city) parts.push(province);

      return parts.length > 0 ? parts.join(", ") : `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  };

  // Format distance
  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const defaultCenter: [number, number] = [45.5017, -73.5673]; // Montreal

  return (
    <div className="space-y-4">
      {/* Search Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LocationSearch
          label="Pickup Location"
          color="#5140BF"
          value={origin}
          onChange={onOriginChange}
          isActive={activePanel === "origin"}
          onFocus={() => setActivePanel("origin")}
        />
        <LocationSearch
          label="Dropoff Location"
          color="#5140BF"
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
          style={{ height: "400px", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController 
            origin={origin} 
            destination={destination}
            routeGeometry={routeInfo?.geometry || null}
          />

          {/* Route polyline - darker purple with glow effect - always show if both locations are set */}
          {origin && destination && routeInfo && routeInfo.geometry && routeInfo.geometry.length > 0 && (
            <>
              {/* Glow layer 1 - outer glow */}
              <Polyline
                key={`route-glow-outer-${origin.lat}-${origin.lng}-${destination.lat}-${destination.lng}`}
                positions={routeInfo.geometry}
                pathOptions={{ 
                  color: "#5140BF",
                  weight: 10,
                  opacity: 0.2,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
              {/* Glow layer 2 - middle glow */}
              <Polyline
                key={`route-glow-middle-${origin.lat}-${origin.lng}-${destination.lat}-${destination.lng}`}
                positions={routeInfo.geometry}
                pathOptions={{ 
                  color: "#5140BF",
                  weight: 7,
                  opacity: 0.4,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
              {/* Main route line */}
              <Polyline
                key={`route-${origin.lat}-${origin.lng}-${destination.lat}-${destination.lng}`}
                positions={routeInfo.geometry}
                pathOptions={{ 
                  color: "#5140BF", // Darker purple
                  weight: 5,
                  opacity: 1,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
            </>
          )}
          
          {/* Fallback: show straight line if route calculation hasn't completed yet or failed */}
          {origin && destination && (!routeInfo || !routeInfo.geometry || routeInfo.geometry.length === 0) && (
            <>
              {/* Glow layer 1 - outer glow */}
              <Polyline
                key={`straight-glow-outer-${origin.lat}-${origin.lng}-${destination.lat}-${destination.lng}`}
                positions={[
                  [origin.lat, origin.lng],
                  [destination.lat, destination.lng],
                ]}
                pathOptions={{ 
                  color: "#5140BF",
                  weight: 8,
                  opacity: 0.2,
                  dashArray: "10, 5",
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
              {/* Glow layer 2 - middle glow */}
              <Polyline
                key={`straight-glow-middle-${origin.lat}-${origin.lng}-${destination.lat}-${destination.lng}`}
                positions={[
                  [origin.lat, origin.lng],
                  [destination.lat, destination.lng],
                ]}
                pathOptions={{ 
                  color: "#5140BF",
                  weight: 6,
                  opacity: 0.4,
                  dashArray: "10, 5",
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
              {/* Main fallback line */}
              <Polyline
                key={`straight-${origin.lat}-${origin.lng}-${destination.lat}-${destination.lng}`}
                positions={[
                  [origin.lat, origin.lng],
                  [destination.lat, destination.lng],
                ]}
                pathOptions={{ 
                  color: "#5140BF", // Darker purple
                  weight: 4,
                  opacity: 0.8,
                  dashArray: "10, 5",
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
            </>
          )}

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
        </MapContainer>

        {/* Route info overlay */}
        {isCalculatingRoute && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md text-sm text-gray-700 flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-[#5140BF]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Calculating route...</span>
          </div>
        )}

        {/* Drag hint */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md text-xs text-gray-600 flex items-center gap-2">
          <span>💡</span>
          <span>Drag pins on map to fine-tune location</span>
        </div>
      </div>

      {/* Route Summary with distance and duration */}
      {origin && destination && (
        <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
          <div className="text-xs font-bold text-[#5140BF] uppercase tracking-wider mb-4">
            Route Details
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-[#5140BF]" />
              <div className="w-0.5 flex-1 bg-gray-300 my-2 min-h-[30px]" />
              <div className="w-4 h-4 rounded-full bg-[#5140BF]" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <div className="text-xs font-semibold text-[#5140BF] mb-1">FROM</div>
                <div className="text-sm font-medium text-gray-900">{origin.address}</div>
              </div>
              {routeInfo && (
                <div className="flex gap-6 pt-2 border-t border-gray-100">
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-1">DISTANCE</div>
                    <div className="text-base font-bold text-gray-900">{formatDistance(routeInfo.distance)}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-1">DURATION</div>
                    <div className="text-base font-bold text-gray-900">{formatDuration(routeInfo.duration)}</div>
                  </div>
                </div>
              )}
              <div>
                <div className="text-xs font-semibold text-[#5140BF] mb-1">TO</div>
                <div className="text-sm font-medium text-gray-900">{destination.address}</div>
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
