import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  DirectionsRenderer,
  Marker,
} from "@react-google-maps/api";
import "./RouteBuilder.css"; // We will create this CSS file

const API_URL = "http://127.0.0.1:8000/api";
const LIBRARIES = ["places"];

// Map Styles
const mapContainerStyle = {
  width: "100%",
  height: "500px",
  borderRadius: "8px",
  marginBottom: "16px",
};

// Santa Maria Center (Default position for new markers)
const defaultCenter = {
  lat: 14.8247,
  lng: 120.9571,
};

function RouteBuilder() {
  const [routes, setRoutes] = useState([]); // To list existing routes
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  // --- NEW: State to track which route is being deleted ---
  const [isDeleting, setIsDeleting] = useState(null); // Will store the ID

  // Form State
  const [routeName, setRouteName] = useState("");
  const [transportTypeId, setTransportTypeId] = useState("1"); // Default to Jeepney

  // Map State
  const [startMarkerPos, setStartMarkerPos] = useState({ lat: 14.8187, lng: 120.9608 }); // Default start
  const [endMarkerPos, setEndMarkerPos] = useState({ lat: 14.9058, lng: 121.0386 }); // Default end
  
  const [directionsResult, setDirectionsResult] = useState(null);
  const [generatedPoints, setGeneratedPoints] = useState([]);
  const [generatedDistance, setGeneratedDistance] = useState(0);

  // --- NEW: Ref to access the DirectionsRenderer instance ---
  const directionsRendererRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script-builder",
    googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY", // <-- PUT YOUR KEY HERE
    libraries: LIBRARIES,
  });

  // Fetch initial data (just existing routes)
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const routesRes = await fetch(`${API_URL}/routes`);
      const routesData = await routesRes.json();
      setRoutes(routesData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      alert("Error: Could not load data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  // --- MODIFIED: Renamed function and removed setDirectionsResult ---
  const updateStateFromResult = (result) => {
    if (!result) return;

    const route = result.routes[0];
    if (!route) return;

    // Extract the full path
    const path = route.overview_path.map((p) => ({
      lat: p.lat(),
      lng: p.lng(),
    }));
    setGeneratedPoints(path);

    // Sum ALL legs for total distance
    let totalDistanceM = 0;
    for (const leg of route.legs) {
      totalDistanceM += leg.distance.value;
    }
    setGeneratedDistance(totalDistanceM / 1000); // Convert meters to KM

    // Update markers to match the (potentially) new start/end
    if (path.length > 0) {
      setStartMarkerPos(path[0]);
      setEndMarkerPos(path[path.length - 1]);
    }
  };

  // --- MODIFIED: Update the listener to use the new function name ---
  const onDirectionsRendererLoad = useCallback((renderer) => {
    directionsRendererRef.current = renderer;
    if (renderer) {
      window.google.maps.event.clearInstanceListeners(renderer);
    
      window.google.maps.event.addListener(
        renderer,
        "directions_changed",
        () => {
          const newResult = renderer.getDirections();
          if (newResult) {
            console.log("Directions updated by user drag.");
            updateStateFromResult(newResult);
          }
        }
      );
    }
  }, []); // Keep the empty dependency array

  // --- Marker Drag Handlers ---
  const onStartMarkerDragEnd = (e) => {
    const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setStartMarkerPos(newPos);
    setDirectionsResult(null); // Clear old route
    setGeneratedPoints([]);
  };

  const onEndMarkerDragEnd = (e) => {
    const newPos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    setEndMarkerPos(newPos);
    setDirectionsResult(null); // Clear old route
    setGeneratedPoints([]);
  };

  // --- MODIFIED: Uses marker positions & new update function ---
  const handleGenerateRoute = () => {
    if (!startMarkerPos || !endMarkerPos) {
      alert("Please place both a Start and End marker.");
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: startMarkerPos, // Use state variable
        destination: endMarkerPos, // Use state variable
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
            // 1. Set the directions to make the route appear on the map
            setDirectionsResult(result);
            // 2. Update our state (points, distance, etc.) from that result
            updateStateFromResult(result); 
            alert("Route generated! You can now drag the blue line to adjust the path.");
        } else {
          console.error(`Error fetching directions: ${status}`);
          alert(`Error: Could not generate route. ${status}`);
        }
      }
    );
  };

  const handleSaveRoute = async (e) => {
    e.preventDefault();

    if (!routeName || !transportTypeId) {
      alert("Please fill in Route Name and Transport Type.");
      return;
    }

    if (generatedPoints.length === 0) {
      alert("Please generate a path first.");
      return;
    }

    setIsSaving(true);
    const payload = {
      route_name: routeName,
      transport_type_id: transportTypeId,
      total_distance_km: generatedDistance.toFixed(2),
      status: "active",
      start_latitude: startMarkerPos.lat,
      start_longitude: startMarkerPos.lng,
      end_latitude: endMarkerPos.lat,
      end_longitude: endMarkerPos.lng,
      points: generatedPoints,
    };

    try {
      const response = await fetch(`${API_URL}/routes-with-points`, { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        let errorMsg = result.message || "Failed to save route";
        if (result.errors) {
            errorMsg = Object.values(result.errors).join(", ");
        }
        throw new Error(errorMsg);
      }

      alert("Success! Route and its path have been saved.");
      
      // Reset form
      setRouteName("");
      setDirectionsResult(null);
      setGeneratedPoints([]);
      setGeneratedDistance(0);
      fetchData(); // Refresh the list of routes
    } catch (error) {
      console.error("Save error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSaving(false);
    } // <-- The hyphen is removed from here
  };
  
  // --- NEW: Delete Route Handler ---
  const handleDeleteRoute = async (routeId) => {
    if (!window.confirm("Are you sure you want to delete this route? This action cannot be undone.")) {
        return;
    }

    setIsDeleting(routeId); // Set loading state for this specific button
    try {
        const response = await fetch(`${API_URL}/routes/${routeId}`, {
            method: "DELETE",
            headers: {
                "Accept": "application/json",
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Failed to delete route");
        }

        alert("Success! Route has been deleted.");
        fetchData(); // Refresh the list
    } catch (error) {
        console.error("Delete error:", error);
        alert(`Error: ${error.message}`);
    } finally {
        setIsDeleting(null); // Clear loading state
    }
  };

  if (loadError) return <div>Error loading map</div>;
  if (!isLoaded || isLoading) return <div>Loading...</div>;

  return (
    <div className="page-center">
      <div className="route-builder-container">
        <h2>Route Builder</h2>
        <p className="description12">
          Drag 'A' (Start) and 'B' (End) markers. Click 'Generate Path'.
          Then, click and drag the blue route line to the exact roads you want.
        </p>

        <form onSubmit={handleSaveRoute}>
          <div className="form-field">
            <label>Route Name:</label>
            <input
              type="text"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              placeholder="e.g., Norzagaray - Santa Maria"
              required
            />
          </div>

          <div className="form-field">
            <label>Transport Type:</label>
            <select
              value={transportTypeId}
              onChange={(e) => setTransportTypeId(e.target.value)}
              required
            >
              <option value="1">Jeepney</option>
              <option value="2">Tricycle</option>
            </select>
          </div>

          <div className="map-container">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={defaultCenter}
              zoom={13}
            >
              {directionsResult && (
                <DirectionsRenderer 
                    directions={directionsResult}
                    options={{ 
                          suppressMarkers: true,
                          draggable: true // Make route draggable
                      }} 
                      onLoad={onDirectionsRendererLoad} // Add listener
                />
              )}
              
              <Marker 
                position={startMarkerPos}
                label="A"
                draggable={true}
                onDragEnd={onStartMarkerDragEnd}
              />
              <Marker 
                position={endMarkerPos}
                label="B"
                draggable={true}
                onDragEnd={onEndMarkerDragEnd}
              />

            </GoogleMap>
          </div>

          <div className="button-group">
            <button
              type="button"
              className="generate-btn"
              onClick={handleGenerateRoute}
              disabled={isSaving || isDeleting}
            >
              Generate Path
            </button>
            <button
              type="submit"
              className="save-btn"
              disabled={isSaving || generatedPoints.length === 0 || isDeleting}
            >
              {isSaving ? "Saving..." : "Save Route"}
            </button>
          </div>
        </form>
      </div>

      <div className="route-builder-container">
        <h2>Existing Routes</h2>
        <div className="item-list-container">
          {isLoading ? ( <p>Loading routes...</p> ) : 
            routes.length === 0 ? (
            <p>No routes found.</p>
          ) : (
            <ul className="item-list">
              {routes.map((r) => (
                <li key={r.id} className="item-list-row">
                  <div className="item-list-info">
                    <strong>{r.route_name}</strong>
                    <span>({r.total_distance_km} km)</span>
                  </div>
                {/* --- NEW: Delete Button --- */}
                <button 
                  className="delete-btn" 
                  onClick={() => handleDeleteRoute(r.id)}
                  disabled={isDeleting === r.id || isSaving}
                >
                  {isDeleting === r.id ? '...' : 'Delete'}
                </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default RouteBuilder;