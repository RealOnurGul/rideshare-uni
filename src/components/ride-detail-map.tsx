"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

interface RideDetailMapProps {
  originLat: number;
  originLng: number;
  originAddress: string;
  destinationLat: number;
  destinationLng: number;
  destinationAddress: string;
}

function RideDetailMapInner({
  originLat,
  originLng,
  originAddress,
  destinationLat,
  destinationLng,
  destinationAddress,
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

  useEffect(() => {
    const loadLeaflet = async () => {
      const L = (await import("leaflet")).default;
      const { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } = await import("react-leaflet");
      setLeaflet({ L, MapContainer, TileLayer, Marker, Popup, Polyline, useMap });
    };
    loadLeaflet();
  }, []);

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
    html: `<div style="background: #9333ea; width: 28px; height: 28px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

  const destinationIcon = L.divIcon({
    className: "custom-marker",
    html: `<div style="background: #7c3aed; width: 28px; height: 28px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"><div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg); width: 8px; height: 8px; background: white; border-radius: 50%;"></div></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

  // Component to smoothly fit bounds after map loads
  function FitBounds() {
    const map = useMap();
    
    useEffect(() => {
      const timeout = setTimeout(() => {
        const bounds = L.latLngBounds(
          [originLat, originLng],
          [destinationLat, destinationLng]
        );
        map.flyToBounds(bounds, {
          padding: [60, 60],
          maxZoom: 12,
          duration: 1.5,
          easeLinearity: 0.25
        });
      }, 200);
      
      return () => clearTimeout(timeout);
    }, [map]);
    
    return null;
  }

  const centerLat = (originLat + destinationLat) / 2;
  const centerLng = (originLng + destinationLng) / 2;

  return (
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

      <Marker position={[originLat, originLng]} icon={originIcon}>
        <Popup>
          <div className="text-sm">
            <p className="font-semibold text-purple-600">Pickup</p>
            <p className="text-gray-600">{originAddress}</p>
          </div>
        </Popup>
      </Marker>

      <Marker position={[destinationLat, destinationLng]} icon={destinationIcon}>
        <Popup>
          <div className="text-sm">
            <p className="font-semibold text-purple-600">Dropoff</p>
            <p className="text-gray-600">{destinationAddress}</p>
          </div>
        </Popup>
      </Marker>

      <Polyline
        positions={[
          [originLat, originLng],
          [destinationLat, destinationLng],
        ]}
        pathOptions={{ color: "#9333ea", weight: 3, dashArray: "10, 10" }}
      />
    </MapContainer>
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
