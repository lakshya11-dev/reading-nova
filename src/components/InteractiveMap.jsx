import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

export default function InteractiveMap({
  latitude,
  longitude,
  address,
  onLocationSelect,
  apiKey = "8097b588fe3543d687ba467d2fb61361",
}) {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);

  // Default to New Delhi or India center if not provided
  const defaultLat = latitude || 28.6139;
  const defaultLon = longitude || 77.209;

  useEffect(() => {
    // Dynamically load Leaflet CSS and JS if not already on window
    const loadLeaflet = () => {
      if (!window.L) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);

        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        script.onload = initMap;
        document.body.appendChild(script);
      } else {
        initMap();
      }
    };

    const initMap = () => {
      if (!mapContainerRef.current || leafletMapRef.current) return;

      const L = window.L;
      const map = L.map(mapContainerRef.current).setView([defaultLat, defaultLon], 13);
      leafletMapRef.current = map;

      // Geoapify Tile Layer
      const tileUrl = `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${apiKey}`;
      L.tileLayer(tileUrl, {
        attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
        maxZoom: 20,
        id: "osm-bright",
      }).addTo(map);

      // Marker icon
      const marker = L.marker([defaultLat, defaultLon], { draggable: true }).addTo(map);
      markerRef.current = marker;

      if (address) {
        marker.bindPopup(`<b>Delivery Pin</b><br/>${address}`).openPopup();
      }

      // Drag event to pick new location
      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        if (onLocationSelect) {
          onLocationSelect(pos.lat, pos.lng);
        }
      });

      // Click anywhere on map to reposition marker
      map.on("click", (e) => {
        marker.setLatLng(e.latlng);
        if (onLocationSelect) {
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        }
      });
    };

    loadLeaflet();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update marker position and pan map when latitude/longitude changes from autocomplete
  useEffect(() => {
    if (leafletMapRef.current && markerRef.current && latitude && longitude) {
      leafletMapRef.current.setView([latitude, longitude], 14);
      markerRef.current.setLatLng([latitude, longitude]);
      if (address) {
        markerRef.current.bindPopup(`<b>Delivery Pin</b><br/>${address}`).openPopup();
      }
    }
  }, [latitude, longitude, address]);

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <div className="bg-slate-100 px-4 py-2 flex items-center justify-between text-xs text-slate-600 border-b border-slate-200">
        <span className="flex items-center gap-1.5 font-semibold">
          <MapPin className="w-4 h-4 text-blue-600" />
          Interactive Delivery Map (Pin Location)
        </span>
        <span className="text-[11px] text-slate-500">Click or drag pin to fine-tune location</span>
      </div>
      <div ref={mapContainerRef} className="h-64 sm:h-72 w-full z-0"></div>
    </div>
  );
}

