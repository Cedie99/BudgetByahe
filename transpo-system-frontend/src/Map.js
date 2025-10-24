import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './Map.css';

const Map = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Don't initialize if map already exists
    if (map.current) return;

    // Don't initialize if container isn't ready
    if (!mapContainer.current) return;

    try {
      // Set access token
      mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

      // Check if token exists
      if (!mapboxgl.accessToken) {
        throw new Error('Mapbox access token is missing. Please check your .env file.');
      }

      console.log('Initializing map...');

      // Note: Mapbox uses [longitude, latitude] format

      // Center of Philippines
      const philippinesCenter = [122.5, 12.5];
      // Santa Maria Municipal Hall, Poblacion, Santa Maria, Bulacan, Philippines
      const santaMariaCoords = [120.96052666814855, 14.819296384824785];

      // Initialize map - Start with Philippines view
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: philippinesCenter,
        zoom: 5.5, // Show whole Philippines
        pitch: 0,
        bearing: 0,
        antialias: true
      });

      // Map load event
      map.current.on('load', () => {
        console.log('Map loaded successfully');
        setLoading(false);

        // Add 3D buildings layer
        try {
          const layers = map.current.getStyle().layers;
          const labelLayerId = layers.find(
            (layer) => layer.type === 'symbol' && layer.layout && layer.layout['text-field']
          )?.id;

          if (labelLayerId) {
            map.current.addLayer(
              {
                id: '3d-buildings',
                source: 'composite',
                'source-layer': 'building',
                filter: ['==', 'extrude', 'true'],
                type: 'fill-extrusion',
                minzoom: 15,
                paint: {
                  'fill-extrusion-color': '#aaa',
                  'fill-extrusion-height': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'height']
                  ],
                  'fill-extrusion-base': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'min_height']
                  ],
                  'fill-extrusion-opacity': 0.6
                }
              },
              labelLayerId
            );
          }
        } catch (err) {
          console.error('Error adding 3D buildings:', err);
        }
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      // Create and add marker
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.innerHTML = `
        <div class="marker-label">
          <span class="marker-title">Santa Maria</span>
          <div class="marker-details">
            <p>Santa Maria Municipal Hall</p>
            <p>Poblacion, Santa Maria, Bulacan</p>
            <button class="zoom-btn">Zoom In</button>
          </div>
        </div>
        <div class="marker-pin"></div>
      `;

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
      })
        .setLngLat(santaMariaCoords)
        .addTo(map.current);

      // Get marker elements
      const markerLabel = el.querySelector('.marker-label');
      const zoomBtn = el.querySelector('.zoom-btn');

      // Expand on hover
      markerLabel.addEventListener('mouseenter', () => {
        markerLabel.classList.add('expanded');
      });

      markerLabel.addEventListener('mouseleave', () => {
        markerLabel.classList.remove('expanded');
      });

      // Zoom in on button click
      if (zoomBtn) {
        zoomBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          map.current.flyTo({
            center: santaMariaCoords,
            zoom: 14,
            pitch: 45,
            bearing: 0,
            duration: 2000,
            essential: true
          });
        });
      }

      // Error handling
      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setError('Failed to load map. Please check your internet connection.');
        setLoading(false);
      });

    } catch (err) {
      console.error('Error initializing map:', err);
      setError(err.message);
      setLoading(false);
    }

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className="map-page">
      <div className="map-header">
        <h1 className="map-title">Byahe Explorer</h1>
        <p className="map-subtitle">Click the location pin to explore the area</p>
      </div>
      <div ref={mapContainer} className="map-container">
        {loading && (
          <div className="map-loading">
            <div className="loading-spinner"></div>
            <p>Loading map...</p>
          </div>
        )}
        {error && (
          <div className="map-error">
            <p>⚠️ {error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Map;
