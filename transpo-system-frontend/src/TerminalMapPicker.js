// src/components/TerminalMapPicker.js

import React from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
} from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "8px",
};

const defaultCenter = {
  lat: 14.8247,
  lng: 120.9571,
};

function TerminalMapPicker({ latitude, longitude, onLocationChange }) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // <-- PUT YOUR KEY HERE
  });

  // Use the passed-in coords if valid, otherwise use the default
  const position = {
    lat: parseFloat(latitude) || defaultCenter.lat,
    lng: parseFloat(longitude) || defaultCenter.lng,
  };

  // Handler for both map click and marker drag
  const handleLocationUpdate = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    onLocationChange(lat, lng);
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      // Center on the marker's position, or the default if no marker
      center={position.lat === defaultCenter.lat ? defaultCenter : position}
      // Zoom in close if a precise point is set, otherwise show the town
      zoom={position.lat === defaultCenter.lat ? 13 : 17}
      onClick={handleLocationUpdate} // Click anywhere on the map
    >
      <Marker
     position={position}
     draggable={true}
     onDragEnd={handleLocationUpdate} // Drag the marker
      />
    </GoogleMap>
  );
}

export default React.memo(TerminalMapPicker);