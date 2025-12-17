"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

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
  seatsAvailable: number;
  driver: {
    name: string | null;
    university: string | null;
  };
}

interface RidesMapProps {
  rides: Ride[];
  onRideSelect: (rideId: string) => void;
  selectedRideId?: string;
}

function RidesMapInner({ rides, onRideSelect, selectedRideId }: RidesMapProps) {
  const [L, setL] = useState<typeof import("leaflet") | null>(null);
  const [MapContainer, setMapContainer] = useState<typeof import("react-leaflet").MapContainer | null>(null);
  const [TileLayer, setTileLayer] = useState<typeof import("react-leaflet").TileLayer | null>(null);
  const [Marker, setMarker] = useState<typeof import("react-leaflet").Marker | null>(null);
  const [Popup, setPopup] = useState<typeof import("react-leaflet").Popup | null>(null);
  const [Polyline, setPolyline] = useState<typeof import("react-leaflet").Polyline | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    const loadLeaflet = async () => {
      const leaflet = await import("leaflet");
      const reactLeaflet = await import("react-leaflet");

      setL(leaflet.default);
      setMapContainer(() => reactLeaflet.MapContainer);
      setTileLayer(() => reactLeaflet.TileLayer);
      setMarker(() => reactLeaflet.Marker);
      setPopup(() => reactLeaflet.Popup);
      setPolyline(() => reactLeaflet.Polyline);
    };

    loadLeaflet();
  }, []);

  if (!isClient || !L || !MapContainer || !TileLayer || !Marker || !Popup || !Polyline) {
    return (
      <div className="w-full h-[500px] bg-gray-100 rounded-2xl flex items-center justify-center">
        <div className="text-gray-500 flex items-center gap-2">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading map...
        </div>
      </div>
    );
  }

  const createIcon = (isSelected: boolean, isOrigin: boolean) =>
    L.divIcon({
      className: "custom-marker",
      html: `<div style="
        background: ${isSelected ? "#7c3aed" : "#9333ea"};
        width: ${isSelected ? "36px" : "28px"};
        height: ${isSelected ? "36px" : "28px"};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,${isSelected ? "0.4" : "0.2"});
        ${isOrigin ? "" : "opacity: 0.7;"}
      "></div>`,
      iconSize: [isSelected ? 36 : 28, isSelected ? 36 : 28],
      iconAnchor: [isSelected ? 18 : 14, isSelected ? 36 : 28],
    });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const defaultCenter: [number, number] = [45.5017, -73.5673];

  const ridesWithCoords = rides.filter(
    (r) => r.originLat && r.originLng
  );

  const center: [number, number] =
    ridesWithCoords.length > 0 && ridesWithCoords[0].originLat && ridesWithCoords[0].originLng
      ? [ridesWithCoords[0].originLat, ridesWithCoords[0].originLng]
      : defaultCenter;

  return (
    <MapContainer
      center={center}
      zoom={11}
      style={{ height: "500px", width: "100%", borderRadius: "1rem" }}
      className="z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {ridesWithCoords.map((ride) => {
        const isSelected = ride.id === selectedRideId;

        return (
          <div key={ride.id}>
            {ride.originLat && ride.originLng && (
              <Marker
                position={[ride.originLat, ride.originLng]}
                icon={createIcon(isSelected, true)}
                eventHandlers={{
                  click: () => onRideSelect(ride.id),
                }}
              >
                <Popup>
                  <div className="text-sm min-w-[200px]">
                    <div className="font-semibold text-gray-900 mb-1">
                      {ride.origin} → {ride.destination}
                    </div>
                    <div className="text-gray-600 text-xs mb-2">
                      {formatDate(ride.dateTime)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-600 font-bold">${ride.pricePerSeat}</span>
                      <span className="text-gray-500 text-xs">
                        {ride.seatsAvailable} seats
                      </span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
                      {ride.driver.name} • {ride.driver.university}
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}

            {ride.originLat &&
              ride.originLng &&
              ride.destinationLat &&
              ride.destinationLng && (
                <Polyline
                  positions={[
                    [ride.originLat, ride.originLng],
                    [ride.destinationLat, ride.destinationLng],
                  ]}
                  pathOptions={{
                    color: isSelected ? "#7c3aed" : "#9333ea",
                    weight: isSelected ? 3 : 2,
                    opacity: isSelected ? 0.8 : 0.4,
                    dashArray: "8, 8",
                  }}
                />
              )}

            {ride.destinationLat && ride.destinationLng && (
              <Marker
                position={[ride.destinationLat, ride.destinationLng]}
                icon={createIcon(isSelected, false)}
                eventHandlers={{
                  click: () => onRideSelect(ride.id),
                }}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold text-purple-600">Destination</p>
                    <p className="text-gray-600">{ride.destination}</p>
                  </div>
                </Popup>
              </Marker>
            )}
          </div>
        );
      })}
    </MapContainer>
  );
}

const RidesMap = dynamic(() => Promise.resolve(RidesMapInner), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-gray-100 rounded-2xl flex items-center justify-center">
      <div className="text-gray-500">Loading map...</div>
    </div>
  ),
});

export default RidesMap;




