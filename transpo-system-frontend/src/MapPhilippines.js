import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import './MapPhilippines.css';

mapboxgl.accessToken = 'pk.eyJ1IjoiY2VkaWVlZSIsImEiOiJjbWJicG94NGswbnFxMmpxMTc5cm93Y2tkIn0.WG-O3ewDyQ8n1w5OYSvCag'; // Your token

const MapPhilippines = () => {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const animationFrameId = useRef(null);

  useEffect(() => {
  const map = new mapboxgl.Map({
    container: mapContainer.current,
    style: 'mapbox://styles/mapbox/satellite-v9',
    center: [121.7740, 10.8797], // Philippines
    zoom: 2.5,
    pitch: 30,
    bearing: 0,
    antialias: true,
    projection: 'globe',
  });

  mapRef.current = map;

  map.on('style.load', () => {
    map.setFog({}); // Optional atmosphere effect

    // Start continuous rotation
    const rotate = () => {
      const currentBearing = map.getBearing();
      map.rotateTo(currentBearing + 0.1, { duration: 0 });
      animationFrameId.current = requestAnimationFrame(rotate);
    };

    rotate();
  });

  return () => {
    if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    map.remove();
  };
}, []);


  return <div ref={mapContainer} className="map-container" />;
};

export default MapPhilippines;
