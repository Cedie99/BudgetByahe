import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import './MapPhilippines.css'; // You can rename this if needed

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const MapEiffelTower = () => {
  const mapContainer = useRef(null);
  const animationFrameId = useRef(null);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/standard',
      center: [120.9579, 14.8185], // Coordinates for Santa Maria, Bulacan
      zoom: 17.5,                // High zoom for detailed 3D
      pitch: 60,                 // Tilt to view building depth
      bearing: -30,              // Optional camera rotation
      antialias: true,
      projection: 'globe',
    });

    map.on('style.load', () => {
      map.setFog({});
      map.setConfigProperty('basemap', 'lightPreset', 'dusk'); // Optional lighting mode
    });

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      map.remove();
    };
  }, []);

  return <div ref={mapContainer} className="map-container" />;
};

export default MapEiffelTower;
