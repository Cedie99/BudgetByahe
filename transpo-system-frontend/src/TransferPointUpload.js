import React, { useState, useEffect } from "react";
import TerminalMapPicker from "./TerminalMapPicker"; // <-- NEW: Import the map picker
import "./TransferPointUpload.css"; 

const API_URL = "http://127.0.0.1:8000/api";

function TransferPointUpload() {
  const [point, setPoint] = useState({
    name: "",
    barangay: "",
    municipality: "Santa Maria", // Default to Santa Maria
    latitude: "",
    longitude: "",
    type: "point", // Hardcode the type to 'point'
  });
  // const [isGeocoding, setIsGeocoding] = useState(false); // --- DELETED ---
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- State to hold the list of points ---
  const [pointsList, setPointsList] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);

  // --- Function to fetch all points ---
  const fetchPoints = async () => {
    setIsLoadingList(true);
    try {
      const response = await fetch(`${API_URL}/transfer-points`);
      if (!response.ok) {
        throw new Error("Failed to fetch points");
      }
      const data = await response.json();
      setPointsList(data);
    } catch (error) {
      console.error("Error fetching points:", error);
      alert("Error: " + error.message);
    } finally {
      setIsLoadingList(false);
    }
  };

  // --- Fetch points when component mounts ---
  useEffect(() => {
    fetchPoints();
  }, []);

  // Handles changes to the input fields
  const handlePointChange = (e) => {
    const { name, value } = e.target;
    setPoint((prev) => ({ ...prev, [name]: value }));
  };

  // --- NEW: Handles location change from the map component ---
  const handleMapLocationChange = (lat, lng) => {
    setPoint((prev) => ({
      ...prev,
      latitude: lat.toFixed(7),
      longitude: lng.toFixed(7),
    }));
  };

  // --- DELETED the handleGeocode function ---

  // Submits the new transfer point to the backend
  const handlePointSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/transfer-points`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(point),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 422) {
          const errors = Object.values(result.errors)
            .map((err) => (Array.isArray(err) ? err.join(", ") : err))
            .join("\n");
          throw new Error(`Validation Failed:\n${errors}`);
        }
        throw new Error(result.error || result.message || "Failed to save data.");
      }

      alert(result.message || `Success! New transfer point has been created.`);

      // --- UPDATE: Add new point to the list in state ---
      // Check if result.data exists, some backends might put it in a different spot
      const newPoint = result.data || result; 
      if (newPoint && newPoint.id) {
        setPointsList(prevList => [...prevList, newPoint]);
      } else {
        // Fallback: just refetch the list if the response is unclear
        fetchPoints();
      }

      // Reset form on success
      setPoint({
        name: "",
        barangay: "",
        municipality: "Santa Maria",
        latitude: "",
        longitude: "",
        type: "point",
      });
    } catch (error) {
      console.error("Submission error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- NEW: Function to handle deletion ---
  const handleDeletePoint = async (pointId) => {
    if (!window.confirm("Are you sure you want to delete this transfer point?")) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/transfer-points/${pointId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete point");
      }

      alert(result.message || "Point deleted successfully!");

      // --- UPDATE: Remove deleted point from the list in state ---
      setPointsList(prevList => prevList.filter(p => p.id !== pointId));

    } catch (error) {
      console.error("Delete error:", error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="page-center">
      {/* UPDATED class names below */}
      <div className="point-upload-container">
        <form onSubmit={handlePointSubmit}>
          <h2>Register New Transfer Point</h2>
          <p className="description">
            Add a new transfer point (e.g., kanto, crossing) to the map.
          </p>
          <div className="point-upload-field">
            <label>Point Name:</label>
            <input
              type="text"
              name="name"
              value={point.name}
              onChange={handlePointChange}
              placeholder="e.g., Pulong Yantok Kanto"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="point-upload-field">
            <label>Barangay:</label>
            <input
              type="text"
              name="barangay"
              value={point.barangay}
              onChange={handlePointChange}
              placeholder="e.g., Pulong Buhangin"
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="point-upload-field">
            <label>Municipality:</label>
            <input 
              type="text" 
              name="municipality" 
              value={point.municipality} 
              onChange={handlePointChange}
              required
              disabled={isSubmitting} 
            />
          </div>

          {/* --- START: REPLACED BLOCK --- */}
          <div className="point-upload-field">
            <label>Point Location:</label>
            <p className="description">
              Click on the map or drag the marker to set the point's
              exact coordinates.
            </p>
            <TerminalMapPicker
              latitude={point.latitude}
              longitude={point.longitude}
              onLocationChange={handleMapLocationChange}
            />
            {/* Optional: Read-only inputs to show the selected coordinates */}
            <div className="coords-group-display">
              <div className="point-upload-field">
                <label>Latitude:</label>
                <input
                  type="text"
                  name="latitude"
                  value={point.latitude}
                  placeholder="Latitude (from map)"
                  readOnly
                  required // <-- Keep validation
                />
              </div>
              <div className="point-upload-field">
                <label>Longitude:</label>
                <input
                  type="text"
                  name="longitude"
                  value={point.longitude}
                  placeholder="Longitude (from map)"
                  readOnly
                  required // <-- Keep validation
                />
              </div>
            </div>
          </div>
          {/* --- END: REPLACED BLOCK --- */}
          
          <button type="submit" className="submit-point-btn" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save New Transfer Point"}
          </button>
        </form>
      </div>

      {/* --- Section 2: The Management List --- */}
      <div className="point-upload-container">
        <h2>Manage Existing Points</h2>
        <div className="item-list-container">
          {isLoadingList ? (
            <p>Loading points...</p>
          ) : pointsList.length === 0 ? (
            <p>No transfer points found.</p>
          ) : (
            <ul className="item-list">
              {pointsList.map((p) => (
                <li key={p.id} className="item-list-row">
                  <div className="item-list-info">
                    <strong>{p.name}</strong>
                    <span>({p.barangay})</span>
                  </div>
                  <button 
                    className="item-list-delete-btn"
                    onClick={() => handleDeletePoint(p.id)}
                  >
                    Delete
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

export default TransferPointUpload;