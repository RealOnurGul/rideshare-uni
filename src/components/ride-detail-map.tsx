"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";

interface RideDetailMapProps {
  originLat: number;
  originLng: number;
  originAddress: string;
  destinationLat: number;
  destinationLng: number;
  destinationAddress: string;
  onRouteCalculated?: (distance: number, duration: number) => void;
}

interface RouteInfo {
  distance: number; // in meters
  duration: number; // in seconds
  geometry: [number, number][]; // decoded polyline coordinates
}

function RideDetailMapInner({
  originLat,
  originLng,
  originAddress,
  destinationLat,
  destinationLng,
  destinationAddress,
  onRouteCalculated,
}: RideDetailMapProps) {
  const [leaflet, setLeaflet] = useState<{
    L: typeof import("leaflet");
    MapContainer: typeof import("react-leaflet").MapContainer;
    TileLayer: typeof import("react-leaflet").TileLayer;
    Marker: typeof import("react-leaflet").Marker;
    Popup: typeof import("react-leaflet").Popup;
    Polyline: typeof import("react-leaflet").Polyline;
    useMap: typeof import("react-leaflet").useMap;
  } | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  useEffect(() => {
    const loadLeaflet = async () => {
      const L = (await import("leaflet")).default;
      const { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } = await import("react-leaflet");
      setLeaflet({ L, MapContainer, TileLayer, Marker, Popup, Polyline, useMap });
    };
    loadLeaflet();
  }, []);

  // Calculate route using OSRM (free and open source)
  const calculateRoute = useCallback(async () => {
    setIsCalculatingRoute(true);
    try {
      // Using OSRM demo server (free, no API key needed)
      const url = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destinationLng},${destinationLat}?overview=full&geometries=geojson`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // OSRM returns GeoJSON coordinates as [lng, lat], convert to [lat, lng] for Leaflet
        const geometry = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
        
        const routeData = {
          distance: route.distance,
          duration: route.duration,
          geometry,
        };
        
        setRouteInfo(routeData);
        
        // Notify parent component of route info
        if (onRouteCalculated) {
          onRouteCalculated(route.distance, route.duration);
        }
      } else {
        // Fallback to straight line if routing fails
        const straightLineDistance = Math.sqrt(
          Math.pow((destinationLat - originLat) * 111000, 2) + 
          Math.pow((destinationLng - originLng) * 111000 * Math.cos(originLat * Math.PI / 180), 2)
        );
        const estimatedDuration = straightLineDistance / 1000 / 80 * 3600; // Assume 80 km/h average
        
        const fallbackRoute = {
          distance: straightLineDistance,
          duration: estimatedDuration,
          geometry: [[originLat, originLng], [destinationLat, destinationLng]] as [number, number][],
        };
        
        setRouteInfo(fallbackRoute);
        if (onRouteCalculated) {
          onRouteCalculated(straightLineDistance, estimatedDuration);
        }
      }
    } catch (error) {
      console.error("Route calculation error:", error);
      // Fallback to straight line with estimated distance/duration
      const straightLineDistance = Math.sqrt(
        Math.pow((destinationLat - originLat) * 111000, 2) + 
        Math.pow((destinationLng - originLng) * 111000 * Math.cos(originLat * Math.PI / 180), 2)
      );
      const estimatedDuration = straightLineDistance / 1000 / 80 * 3600;
      
      const fallbackRoute = {
        distance: straightLineDistance,
        duration: estimatedDuration,
        geometry: [[originLat, originLng], [destinationLat, destinationLng]] as [number, number][],
      };
      
      setRouteInfo(fallbackRoute);
      if (onRouteCalculated) {
        onRouteCalculated(straightLineDistance, estimatedDuration);
      }
    } finally {
      setIsCalculatingRoute(false);
    }
  }, [originLat, originLng, destinationLat, destinationLng, onRouteCalculated]);

  // Calculate route when component mounts
  useEffect(() => {
    if (leaflet) {
      calculateRoute();
    }
  }, [leaflet, calculateRoute]);

  if (!leaflet) {
    return (
      <div className="w-full h-[300px] bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-gray-500 flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading map...
        </div>
      </div>
    );
  }

  const { L, MapContainer, TileLayer, Marker, Popup, Polyline, useMap } = leaflet;

  const originIcon = L.divIcon({
    className: "custom-marker",
    html: `<div style="background: #5140BF; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.3);"></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  const destinationIcon = L.divIcon({
    className: "custom-marker",
    html: `<div style="background: #5140BF; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.3);"></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  // Component to smoothly fit bounds after map loads
  function FitBounds() {
    const map = useMap();
    
    useEffect(() => {
      const timeout = setTimeout(() => {
        let bounds: L.LatLngBounds;
        if (routeInfo && routeInfo.geometry.length > 0) {
          bounds = L.latLngBounds(routeInfo.geometry);
        } else {
          bounds = L.latLngBounds(
            [originLat, originLng],
            [destinationLat, destinationLng]
          );
        }
        map.flyToBounds(bounds, {
          padding: [60, 60],
          maxZoom: 12,
          duration: 1.5,
          easeLinearity: 0.25
        });
      }, 200);
      
      return () => clearTimeout(timeout);
    }, [map, routeInfo]);
    
    return null;
  }

  const centerLat = (originLat + destinationLat) / 2;
  const centerLng = (originLng + destinationLng) / 2;

  return (
    <div className="relative">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={10}
        style={{ height: "300px", width: "100%", borderRadius: "0.75rem" }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds />

        {/* Route polyline - glowing purple effect - only show when route is calculated */}
        {routeInfo && routeInfo.geometry && routeInfo.geometry.length > 0 && !isCalculatingRoute && (
          <>
            {/* Glow layer 1 - outer glow */}
            <Polyline
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
              positions={routeInfo.geometry}
              pathOptions={{ 
                color: "#5140BF",
                weight: 5,
                opacity: 1,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </>
        )}

        <Marker position={[originLat, originLng]} icon={originIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold text-[#5140BF]">Pickup</p>
              <p className="text-gray-600">{originAddress}</p>
            </div>
          </Popup>
        </Marker>

        <Marker position={[destinationLat, destinationLng]} icon={destinationIcon}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold text-[#5140BF]">Dropoff</p>
              <p className="text-gray-600">{destinationAddress}</p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      
      {isCalculatingRoute && (
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md text-xs text-gray-700 flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-[#5140BF]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Calculating route...</span>
        </div>
      )}
    </div>
  );
}

const RideDetailMap = dynamic(() => Promise.resolve(RideDetailMapInner), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] bg-gray-100 rounded-xl flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
});

export default RideDetailMap;
