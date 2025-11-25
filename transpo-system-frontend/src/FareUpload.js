import React, { useState, useRef, useEffect } from "react";
import Papa from "papaparse";
import "./FareUpload.css"; // Your NEW styles
import TerminalMapPicker from "./TerminalMapPicker"; // Your map component

const API_URL = "http://127.0.0.1:8000/api";

function FareUpload() {
  // --- Global States ---
  const [category, setCategory] = useState(""); // "LTFRB" or "LGU"
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- LTFRB (Jeepney) File Upload States ---
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const fileInputRef = useRef(null);

  // --- Terminal Form States ---
  const [terminal, setTerminal] = useState({
    name: "",
    association_name: "",
    barangay: "",
    municipality: "Santa Maria",
    latitude: "",
    longitude: "",
    transport_type_id: 2, // Default to 2 (Tricycle)
  });
  const [terminalsList, setTerminalsList] = useState([]);
  const [isLoadingTerminals, setIsLoadingTerminals] = useState(true);

  // --- LGU (Tricycle) Single Entry Form States ---
  const [lguDestination, setLguDestination] = useState({
    place: "", // This will be the association_name, e.g., "PB-GVMPTODA"
    location: "", // e.g., "Green Valley"
    fare: "",
    latitude: "",
    longitude: "",
  });
  const [destinationsList, setDestinationsList] = useState([]);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(false);
  const [selectedToda, setSelectedToda] = useState(""); // The TODA we are viewing destinations for

  // --- Fetch all terminals (TODAs) when component mounts ---
  const fetchTerminals = async () => {
    setIsLoadingTerminals(true);
    try {
      const response = await fetch(`${API_URL}/terminals`);
      if (!response.ok) throw new Error("Failed to fetch terminals");
      const data = await response.json();
      // Filter for Tricycle Terminals (transport_type_id == 2)
      const todaTerminals = data.filter((t) => t.transport_type_id === 2);
      setTerminalsList(todaTerminals);
      if (todaTerminals.length > 0) {
        // Set default selected TODA and pre-fill form
        const defaultToda = todaTerminals[0].association_name;
        setSelectedToda(defaultToda);
        setLguDestination((prev) => ({ ...prev, place: defaultToda }));
      }
    } catch (error) {
      console.error("Error fetching terminals:", error);
    } finally {
      setIsLoadingTerminals(false);
    }
  };

  useEffect(() => {
    fetchTerminals();
  }, []);

  // --- Fetch destinations when the selectedToda or category changes ---
  useEffect(() => {
    if (category !== "LGU" || !selectedToda) {
      setDestinationsList([]);
      return;
    }
    const fetchDestinations = async () => {
      setIsLoadingDestinations(true);
      try {
        const response = await fetch(`${API_URL}/fares/${selectedToda}`); // Use your existing Fares.js endpoint
        if (response.ok) {
          const data = await response.json();
          setDestinationsList(data.data || []);
        } else {
          setDestinationsList([]);
        }
      } catch (error) {
        console.error("Error fetching destinations:", error);
      } finally {
        setIsLoadingDestinations(false);
      }
    };
    fetchDestinations();
  }, [category, selectedToda]);
  
  // ===================================
  // --- LTFRB (JEEPNEY) FILE LOGIC ---
  // ===================================
  const handleFileProcess = (file) => {
    if (!file) return;
    if (file.type !== "text/csv") {
      alert("Unsupported file type. Please upload a CSV.");
      return;
    }
    setFileName(file.name);
    setFileToUpload(file);
  };
  const handleFileChange = (e) => handleFileProcess(e.target.files[0]);
  const handleDragOver = (e) => (e.preventDefault(), setIsDragging(true));
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileProcess(e.dataTransfer.files[0]);
  };

  const handleJeepneyFareSubmit = () => {
    if (!fileToUpload) {
      alert("Please select a CSV file for the LTFRB fares.");
      return;
    }
    setIsSubmitting(true);
    Papa.parse(fileToUpload, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().replace(/"/g, ''),
      complete: async (results) => {
        const payload = {
          data: results.data.map((row) => ({
            distance_km: parseFloat(row["Distance (kms.)"]) || 0,
            regular_fare: parseFloat(row["Regular"]) || 0,
            discounted_fare:
              parseFloat(row["Student / Elderly / Disabled"]) || 0,
          })),
        };
        try {
          const response = await fetch(`${API_URL}/jeepney-fares/bulk`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(payload),
          });
          const result = await response.json();
          if (!response.ok)
            throw new Error(result.message || "Failed to save data.");
          alert(result.message || "Jeepney fares updated successfully!");
          setFileName("");
          setFileToUpload(null);
        } catch (error) {
          alert(`Error: ${error.message}`);
        } finally {
          setIsSubmitting(false);
        }
      },
      error: (err) => (
        alert("CSV Parsing Error: " + err.message), setIsSubmitting(false)
      ),
    });
  };

  // ===================================
  // --- TERMINAL FORM LOGIC ---
  // ===================================
  const handleTerminalChange = (e) => {
    const { name, value } = e.target;
    setTerminal((prev) => ({ ...prev, [name]: value }));
  };
  const handleMapLocationChange = (lat, lng) => {
    setTerminal((prev) => ({
      ...prev,
      latitude: lat.toFixed(7),
      longitude: lng.toFixed(7),
    }));
  };
  const handleTerminalSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/terminals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(terminal),
      });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 422) {
          const errors = Object.values(result.errors).flat().join("\n");
          throw new Error(`Validation Failed:\n${errors}`);
        }
        throw new Error(result.error || result.message || "Failed to save data.");
      }
      alert(result.message || `Success! Terminal ${result.data.name} created.`);
      fetchTerminals(); // Refresh the terminals list
      setTerminal({
        name: "",
        association_name: "",
        barangay: "",
        municipality: "Santa Maria",
        latitude: "",
        longitude: "",
        transport_type_id: 2,
      });
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDeleteTerminal = async (terminalId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this terminal? This will also delete ALL its associated destinations."
      )
    ) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/terminals/${terminalId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to delete");
      alert(result.message || "Terminal deleted successfully!");
      fetchTerminals(); // Refresh list
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  // ===================================
  // --- LGU (TRICYCLE) DESTINATION LOGIC ---
  // ===================================
  const handleLguChange = (e) => {
    const { name, value } = e.target;
    // When changing the TODA select, also update the 'selectedToda' for the management list
    if (name === "place") {
        setSelectedToda(value);
    }
    setLguDestination((prev) => ({ ...prev, [name]: value }));
  };
  const handleLguMapChange = (lat, lng) => {
    setLguDestination((prev) => ({
      ...prev,
      latitude: lat.toFixed(7),
      longitude: lng.toFixed(7),
    }));
  };
  const handleLguDestinationSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/tricycle-fares`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(lguDestination),
      });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 422) {
          const errors = Object.values(result.errors).flat().join("\n");
          throw new Error(`Validation Failed:\n${errors}`);
        }
        throw new Error(result.message || "Failed to save data.");
      }
      alert(result.message || "Tricycle destination saved!");
      // Add to list manually to avoid a full re-fetch
      setDestinationsList((prevList) => [...prevList, result.data]);
      // Reset only the destination-specific fields
      setLguDestination((prev) => ({
        ...prev,
        location: "",
        fare: "",
        latitude: "",
        longitude: "",
      }));
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDeleteDestination = async (destinationId) => {
    if (!window.confirm("Are you sure you want to delete this destination?"))
      return;
    try {
      const response = await fetch(
        `${API_URL}/tricycle-fares/${destinationId}`,
        { method: "DELETE" }
      );
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to delete");
      alert(result.message || "Destination deleted!");
      setDestinationsList((prevList) =>
        prevList.filter((d) => d.id !== destinationId)
      );
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  // ===================================
  // --- JSX RENDER ---
  // ===================================

  return (
    <div className="page-center">
      {/* --- This is the main category selector card --- */}
      <div className="fare-upload-container">
        <h2>Admin Fare & Terminal Management</h2>
        
        <div className="fare-upload-field">
          <label>Select Management Category:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="fare-upload-select"
          >
            <option value="">-- Choose Category --</option>
            <option value="Terminals">Register & Manage Terminals</option>
            <option value="LTFRB">Upload LTFRB (Jeepney) Fares</option>
            <option value="LGU">Add & Manage LGU (Tricycle) Destinations</option>
          </select>
        </div>
      </div>
      
      {/* --- Section 1: Register Terminal Form (Now includes management) --- */}
      {category === "Terminals" && (
        <div className="fare-upload-container terminal-form">
          <form onSubmit={handleTerminalSubmit}>
            <h2>Register New Terminal (Hub)</h2>
            <p className="description">
              Create a new "Hub" here, like a TODA or Jeepney terminal.
            </p>
            
            <div className="fare-upload-field"><label>Terminal Name:</label><input type="text" name="name" value={terminal.name} onChange={handleTerminalChange} placeholder="e.g., PB-GVMPTODA Terminal" required disabled={isSubmitting}/></div>
            <div className="fare-upload-field"><label>Association Name:</label><input type="text" name="association_name" value={terminal.association_name} onChange={handleTerminalChange} placeholder="e.g., PB-GVMPTODA" required disabled={isSubmitting}/></div>
            <div className="fare-upload-field"><label>Barangay:</label><input type="text" name="barangay" value={terminal.barangay} onChange={handleTerminalChange} placeholder="e.g., Poblacion" required disabled={isSubmitting}/></div>
            <div className="fare-upload-field"><label>Municipality:</label><input type="text" name="municipality" value={terminal.municipality} onChange={handleTerminalChange} required disabled={isSubmitting}/></div>

            <div className="fare-upload-field">
              <label>Terminal Location (The "Hub"):</label>
              <p className="description" style={{marginBottom: '16px'}}>Set the *terminal's* exact coordinates.</p>
              <TerminalMapPicker
                latitude={terminal.latitude}
                longitude={terminal.longitude}
                onLocationChange={handleMapLocationChange}
              />
              <div className="coords-group-display">
                <input type="text" value={terminal.latitude} placeholder="Latitude (from map)" readOnly />
                <input type="text" value={terminal.longitude} placeholder="Longitude (from map)" readOnly />
              </div>
            </div>
            
            <div className="fare-upload-field">
              <label>Transport Type:</label>
              <select name="transport_type_id" value={terminal.transport_type_id} onChange={handleTerminalChange} required disabled={isSubmitting}>
                <option value="2">Tricycle</option>
                <option value="1">Jeepney</option>
              </select>
            </div>

            <button type="submit" className="submit-terminal-btn" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save New Terminal"}
            </button>
          </form>

          {/* --- Divider --- */}
          <hr className="section-divider" />

          {/* --- Terminal Management List (Now in the same card) --- */}
          <div className="item-list-container" style={{marginTop: '0'}}>
            <h3>Manage Existing Terminals</h3>
            {isLoadingTerminals ? <p>Loading...</p> : 
             terminalsList.length === 0 ? <p>No terminals found.</p> :
            (
             <ul className="item-list">
              {terminalsList.map((t) => (
                <li key={t.id} className="item-list-row">
                  <div className="item-list-info">
                    <strong>{t.name}</strong>
                    <span>({t.association_name}) - {t.transport_type_id === 1 ? 'Jeep' : 'Tricycle'}</span>
                  </div>
                  <button className="item-list-delete-btn" onClick={() => handleDeleteTerminal(t.id)}>Delete</button>
                </li>
              ))}
             </ul>
            )}
          </div>
        </div>
      )}

      {/* --- Section 2: LTFRB (Jeepney) Fare Upload --- */}
      {category === "LTFRB" && (
        <div className="fare-upload-container terminal-form">
          <h2>Upload LTFRB (Jeepney) Fares</h2>
          <p className="description">
            Upload the complete distance-based fare matrix for jeepneys. This will replace any existing data.
          </p>
          <div
            className={`drag-drop-zone ${isDragging ? "dragging" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isSubmitting && fileInputRef.current.click()}
          >
            <p>
              {isSubmitting ? `Submitting ${fileName}...` : fileName ? `Selected: ${fileName}` : "Drag & drop LTFRB CSV file here"}
            </p>
            {!fileName && !isSubmitting && <span style={{fontSize: '0.9rem'}}>or click to browse</span>}
          </div>
          <input type="file" accept=".csv" onChange={handleFileChange} ref={fileInputRef} style={{ display: "none" }} disabled={isSubmitting} />
          
          <button 
            type="button" 
            className="submit-terminal-btn" 
            onClick={handleJeepneyFareSubmit} 
            disabled={isSubmitting || !fileToUpload}
            style={{marginTop: '24px'}}
          >
            {isSubmitting ? "Uploading..." : "Upload Jeepney Fares"}
          </button>
        </div>
      )}

      {/* --- Section 3: LGU (Tricycle) Destination Entry (Now includes management) --- */}
      {category === "LGU" && (
        <div className="fare-upload-container terminal-form">
          <form onSubmit={handleLguDestinationSubmit}>
            <h2>Add Tricycle Destination</h2>
            <p className="description">
              Select a TODA, then add one destination (e.g., "Green Valley") and set its location on the map.
            </p>
            
            <div className="fare-upload-field">
              <label>TODA Association (Place):</label>
              <select name="place" value={lguDestination.place} onChange={handleLguChange} className="fare-upload-select" required disabled={isSubmitting || isLoadingTerminals}>
                <option value="">-- Select TODA --</option>
                {terminalsList.map(t => (
                  <option key={t.id} value={t.association_name}>{t.association_name}</option>
                ))}
              </select>
            </div>

            <div className="fare-upload-field">
              <label>Destination Name:</label>
              <input type="text" name="location" value={lguDestination.location} onChange={handleLguChange} placeholder="e.g., Green Valley" required disabled={isSubmitting}/>
            </div>

            <div className="fare-upload-field">
              <label>Fare (₱):</label>
              <input type="number" name="fare" value={lguDestination.fare} onChange={handleLguChange} placeholder="e.g., 20.00" step="0.01" required disabled={isSubmitting}/>
            </div>

            <div className="fare-upload-field">
              <label>Set Destination Location (The "Drop-off"):</label>
              <TerminalMapPicker
                latitude={lguDestination.latitude}
                longitude={lguDestination.longitude}
                onLocationChange={handleLguMapChange} // Use the LGU-specific handler
              />
              <div className="coords-group-display">
                <input type="text" value={lguDestination.latitude} placeholder="Latitude (from map)" readOnly />
                <input type="text" value={lguDestination.longitude} placeholder="Longitude (from map)" readOnly />
              </div>
            </div>

            <button type="submit" className="submit-terminal-btn" disabled={isSubmitting || !lguDestination.place}>
              {isSubmitting ? "Saving..." : "Save Destination"}
            </button>
          </form>

          {/* --- Divider --- */}
          <hr className="section-divider" />

          {/* --- Destination Management List (Now in the same card) --- */}
          <div className="item-list-container" style={{marginTop: '0'}}>
            <h2>Manage Destinations for:</h2>
            <select
              className="fare-upload-select" // Use the unified class
              value={selectedToda}
              onChange={(e) => {
                setSelectedToda(e.target.value);
                // Also update the form above
                setLguDestination(prev => ({ ...prev, place: e.target.value }));
              }}
              disabled={isLoadingTerminals}
              style={{marginBottom: '20px'}}
            >
              <option value="">-- Select a TODA to View --</option>
              {terminalsList.map(t => (
                <option key={t.id} value={t.association_name}>{t.association_name}</option>
              ))}
            </select>

            {isLoadingDestinations ? <p>Loading destinations...</p> : 
              destinationsList.length === 0 ? <p>No destinations found for {selectedToda}.</p> : 
              (
                <ul className="item-list">
                  {destinationsList.map((dest) => (
                    <li key={dest.id} className="item-list-row">
                      <div className="item-list-info">
                        <strong>{dest.location}</strong>
                        <span>(Fare: ₱{parseFloat(dest.fare).toFixed(2)})</span>
                      </div>
                      <button className="item-list-delete-btn" onClick={() => handleDeleteDestination(dest.id)}>
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
          </div>
        </div>
      )}

    </div>
  );
}

export default FareUpload;