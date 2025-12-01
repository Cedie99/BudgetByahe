import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import { auth, signOut } from '../firebase';
import TerminalMapPicker from '../TerminalMapPicker';
import './AdminFareUpload.css';
import AdminSidebar from './AdminSidebar';

const API_URL = "http://127.0.0.1:8000/api";

// SVG Icons Component
const Icons = {
  Briefcase: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  ),
  AlertCircle: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="8" x2="12" y2="12"></line>
      <line x1="12" y1="16" x2="12.01" y2="16"></line>
    </svg>
  ),
  MapPin: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  ),
  Bus: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6h8M6 6h12v12H6z"></path>
      <circle cx="9" cy="17" r="2"></circle>
      <circle cx="15" cy="17" r="2"></circle>
      <path d="M6 9h12"></path>
    </svg>
  ),
  Upload: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
  ),
  Trash: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  ),
  Check: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ),
  Loader: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 2a10 10 0 0 1 0 20"></path>
    </svg>
  ),
  Map: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
      <line x1="8" y1="2" x2="8" y2="18"></line>
      <line x1="16" y1="2" x2="16" y2="22"></line>
    </svg>
  ),
  Person: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  Jeepney: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="8" width="20" height="10" rx="2"></rect>
      <circle cx="6" cy="19" r="2"></circle>
      <circle cx="18" cy="19" r="2"></circle>
      <path d="M2 8V6a2 2 0 0 1 2-2h4"></path>
      <line x1="7" y1="8" x2="7" y2="4"></line>
    </svg>
  ),
};

function AdminFareUpload() {
  const navigate = useNavigate();
  // --- Global States ---
  const [category, setCategory] = useState("");
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
    transport_type_id: 2,
  });
  const [terminalsList, setTerminalsList] = useState([]);
  const [isLoadingTerminals, setIsLoadingTerminals] = useState(true);

  // --- LGU (Tricycle) Single Entry Form States ---
  const [lguDestination, setLguDestination] = useState({
    place: "",
    location: "",
    fare: "",
    latitude: "",
    longitude: "",
  });
  const [destinationsList, setDestinationsList] = useState([]);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(false);
  const [selectedToda, setSelectedToda] = useState("");

  // --- Transfer Point Form States ---
  const [transferPoint, setTransferPoint] = useState({
    name: "",
    barangay: "",
    municipality: "Santa Maria",
    latitude: "",
    longitude: "",
    type: "point",
  });
  const [transferPointsList, setTransferPointsList] = useState([]);
  const [isLoadingTransferPoints, setIsLoadingTransferPoints] = useState(true);

  // --- Fetch all terminals (TODAs) when component mounts ---
  const fetchTerminals = async () => {
    setIsLoadingTerminals(true);
    try {
      const response = await fetch(`${API_URL}/terminals`);
      if (!response.ok) throw new Error("Failed to fetch terminals");
      const data = await response.json();
      const todaTerminals = data.filter((t) => t.transport_type_id === 2);
      setTerminalsList(todaTerminals);
      if (todaTerminals.length > 0) {
        setSelectedToda(todaTerminals[0].association_name);
      }
    } catch (error) {
      console.error("Error fetching terminals:", error);
    } finally {
      setIsLoadingTerminals(false);
    }
  };

  // --- Fetch transfer points ---
  const fetchTransferPoints = async () => {
    setIsLoadingTransferPoints(true);
    try {
      const response = await fetch(`${API_URL}/transfer-points`);
      if (!response.ok) throw new Error("Failed to fetch transfer points");
      const data = await response.json();
      setTransferPointsList(data);
    } catch (error) {
      console.error("Error fetching transfer points:", error);
    } finally {
      setIsLoadingTransferPoints(false);
    }
  };

  useEffect(() => {
    fetchTerminals();
    fetchTransferPoints();
  }, []);

  // --- Fetch destinations when selectedToda or category changes ---
  useEffect(() => {
    if (category !== "LGU" || !selectedToda) {
      setDestinationsList([]);
      return;
    }
    const fetchDestinations = async () => {
      setIsLoadingDestinations(true);
      try {
        const response = await fetch(`${API_URL}/fares/${selectedToda}`);
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
      fetchTerminals();
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
      if (!response.ok) throw new Error("Failed to delete terminal");
      alert("Terminal deleted successfully!");
      fetchTerminals();
    } catch (error) {
      alert("Error deleting terminal: " + error.message);
    }
  };

  // ===================================
  // --- LGU (TRICYCLE) DESTINATION LOGIC ---
  // ===================================
  const handleLguChange = (e) => {
    const { name, value } = e.target;
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
      setDestinationsList((prevList) => [...prevList, result.data]);
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
  // --- TRANSFER POINT LOGIC ---
  // ===================================
  const handleTransferPointChange = (e) => {
    const { name, value } = e.target;
    setTransferPoint((prev) => ({ ...prev, [name]: value }));
  };

  const handleTransferPointMapChange = (lat, lng) => {
    setTransferPoint((prev) => ({
      ...prev,
      latitude: lat.toFixed(7),
      longitude: lng.toFixed(7),
    }));
  };

  const handleTransferPointSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/transfer-points`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(transferPoint),
      });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 422) {
          const errors = Object.values(result.errors).flat().join("\n");
          throw new Error(`Validation Failed:\n${errors}`);
        }
        throw new Error(result.error || result.message || "Failed to save data.");
      }
      alert(result.message || "Transfer point created successfully!");
      const newPoint = result.data || result;
      if (newPoint && newPoint.id) {
        setTransferPointsList((prevList) => [...prevList, newPoint]);
      } else {
        fetchTransferPoints();
      }
      setTransferPoint({
        name: "",
        barangay: "",
        municipality: "Santa Maria",
        latitude: "",
        longitude: "",
        type: "point",
      });
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTransferPoint = async (pointId) => {
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
      if (!response.ok) throw new Error(result.error || "Failed to delete point");
      alert(result.message || "Transfer point deleted successfully!");
      setTransferPointsList((prevList) => prevList.filter((p) => p.id !== pointId));
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminId');
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('adminName');
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="admin-fare-upload-wrapper">
      <AdminSidebar activePage="fares" onLogout={handleLogout} />

      {/* --- Main Category Selector Card --- */}
      <div className="admin-fare-container admin-fare-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Icons.Briefcase />
          <h1 className="admin-fare-title">Fare & Terminal Management</h1>
        </div>
        <p className="admin-fare-subtitle">Manage fares, terminals, destinations, and transfer points</p>

        <div className="admin-fare-field">
          <label htmlFor="category-select" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Icons.AlertCircle />
            Select Management Category
          </label>
          <select
            id="category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="admin-fare-select"
          >
            <option value="">-- Choose a Category --</option>
            <option value="Terminals">Register & Manage Terminals</option>
            <option value="LTFRB">Upload LTFRB (Jeepney) Fares</option>
            <option value="LGU">Add & Manage LGU (Tricycle) Destinations</option>
            <option value="TransferPoints">Register & Manage Transfer Points</option>
          </select>
        </div>
      </div>

      {/* --- Section 1: Register Terminal Form --- */}
      {category === "Terminals" && (
        <div className="admin-fare-container">
          <form onSubmit={handleTerminalSubmit} className="admin-fare-form">
            <div className="admin-fare-form-header">
              <div>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icons.Bus />
                  Register New Terminal
                </h2>
                <p>Create a new transport hub for TODA or Jeepney terminals</p>
              </div>
            </div>

            <div className="admin-fare-form-grid">
              <div className="admin-fare-field">
                <label htmlFor="terminal-name">Terminal Name</label>
                <input
                  id="terminal-name"
                  type="text"
                  name="name"
                  value={terminal.name}
                  onChange={handleTerminalChange}
                  placeholder="e.g., PB-GVMPTODA Terminal"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="admin-fare-field">
                <label htmlFor="association-name">Association Name</label>
                <input
                  id="association-name"
                  type="text"
                  name="association_name"
                  value={terminal.association_name}
                  onChange={handleTerminalChange}
                  placeholder="e.g., PB-GVMPTODA"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="admin-fare-field">
                <label htmlFor="barangay">Barangay</label>
                <input
                  id="barangay"
                  type="text"
                  name="barangay"
                  value={terminal.barangay}
                  onChange={handleTerminalChange}
                  placeholder="e.g., Poblacion"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="admin-fare-field">
                <label htmlFor="municipality">Municipality</label>
                <input
                  id="municipality"
                  type="text"
                  name="municipality"
                  value={terminal.municipality}
                  onChange={handleTerminalChange}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="admin-fare-field">
                <label htmlFor="transport-type">Transport Type</label>
                <select
                  id="transport-type"
                  name="transport_type_id"
                  value={terminal.transport_type_id}
                  onChange={handleTerminalChange}
                  required
                  disabled={isSubmitting}
                >
                  <option value="2">Tricycle</option>
                  <option value="1">Jeepney</option>
                </select>
              </div>
            </div>

            <div className="admin-fare-field admin-fare-field-full">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icons.MapPin />
                Terminal Location
              </label>
              <p className="admin-fare-help-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icons.AlertCircle />
                Click on the map to set the exact terminal coordinates
              </p>
              <TerminalMapPicker
                latitude={terminal.latitude}
                longitude={terminal.longitude}
                onLocationChange={handleMapLocationChange}
              />
              <div className="admin-fare-coords-display">
                <div>
                  <strong>Latitude:</strong>
                  <input type="text" value={terminal.latitude} placeholder="Latitude" readOnly />
                </div>
                <div>
                  <strong>Longitude:</strong>
                  <input type="text" value={terminal.longitude} placeholder="Longitude" readOnly />
                </div>
              </div>
            </div>

            <button type="submit" className="admin-fare-btn admin-fare-btn-primary" disabled={isSubmitting}>
              <Icons.Check />
              {isSubmitting ? "Saving Terminal..." : "Save New Terminal"}
            </button>
          </form>

          {/* --- Terminal Management List --- */}
          <div className="admin-fare-list-section">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.Map />
              Manage Existing Terminals
            </h3>
            {isLoadingTerminals ? (
              <p className="admin-fare-loading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icons.Loader className="spinner" />
                Loading terminals...
              </p>
            ) : terminalsList.length === 0 ? (
              <p className="admin-fare-empty">No terminals found yet</p>
            ) : (
              <ul className="admin-fare-list">
                {terminalsList.map((t) => (
                  <li key={t.id} className="admin-fare-list-item">
                    <div className="admin-fare-list-content">
                      <h4>{t.name}</h4>
                      <p>{t.association_name} • {t.transport_type_id === 1 ? 'Jeepney' : 'Tricycle'}</p>
                      <span className="admin-fare-list-meta" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Icons.MapPin />
                        {t.barangay}, {t.municipality}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="admin-fare-btn admin-fare-btn-danger"
                      onClick={() => handleDeleteTerminal(t.id)}
                    >
                      <Icons.Trash />
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* --- Section 2: LTFRB (Jeepney) Fare Upload --- */}
      {category === "LTFRB" && (
        <div className="admin-fare-container">
          <div className="admin-fare-form-header">
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icons.Jeepney />
                Upload LTFRB Jeepney Fares
              </h2>
              <p>Upload the complete distance-based fare matrix for all jeepney routes</p>
            </div>
          </div>

          <div
            className={`admin-fare-dropzone ${isDragging ? "dragging" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isSubmitting && fileInputRef.current.click()}
          >
            <Icons.Upload className="admin-fare-dropzone-icon" />
            <p className="admin-fare-dropzone-text">
              {isSubmitting ? `Uploading ${fileName}...` : fileName ? `Selected: ${fileName}` : "Drag and drop your CSV file here"}
            </p>
            {!fileName && !isSubmitting && <span className="admin-fare-dropzone-hint">or click to browse files</span>}
          </div>

          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: "none" }}
            disabled={isSubmitting}
          />

          <button
            type="button"
            className="admin-fare-btn admin-fare-btn-primary"
            onClick={handleJeepneyFareSubmit}
            disabled={isSubmitting || !fileToUpload}
            style={{ marginTop: '24px' }}
          >
            <Icons.Upload />
            {isSubmitting ? "Uploading Fares..." : "Upload Jeepney Fares"}
          </button>
        </div>
      )}

      {/* --- Section 3: LGU (Tricycle) Destination Entry --- */}
      {category === "LGU" && (
        <div className="admin-fare-container">
          <form onSubmit={handleLguDestinationSubmit} className="admin-fare-form">
            <div className="admin-fare-form-header">
              <div>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icons.Person />
                  Add Tricycle Destination
                </h2>
                <p>Select a TODA and add destination routes with fares</p>
              </div>
            </div>

            <div className="admin-fare-form-grid">
              <div className="admin-fare-field admin-fare-field-full">
                <label htmlFor="lgu-place" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icons.Bus />
                  TODA Association
                </label>
                <select
                  id="lgu-place"
                  name="place"
                  value={lguDestination.place}
                  onChange={handleLguChange}
                  className="admin-fare-select"
                  required
                  disabled={isSubmitting || isLoadingTerminals}
                >
                  <option value="">-- Select a TODA --</option>
                  {terminalsList.map((t) => (
                    <option key={t.id} value={t.association_name}>
                      {t.association_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-fare-field">
                <label htmlFor="lgu-location" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icons.MapPin />
                  Destination Name
                </label>
                <input
                  id="lgu-location"
                  type="text"
                  name="location"
                  value={lguDestination.location}
                  onChange={handleLguChange}
                  placeholder="e.g., Green Valley"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="admin-fare-field">
                <label htmlFor="lgu-fare">Fare (₱)</label>
                <input
                  id="lgu-fare"
                  type="number"
                  name="fare"
                  value={lguDestination.fare}
                  onChange={handleLguChange}
                  placeholder="e.g., 20.00"
                  step="0.01"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="admin-fare-field admin-fare-field-full">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icons.MapPin />
                Destination Location
              </label>
              <p className="admin-fare-help-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icons.AlertCircle />
                Click on the map to set the drop-off point coordinates
              </p>
              <TerminalMapPicker
                latitude={lguDestination.latitude}
                longitude={lguDestination.longitude}
                onLocationChange={handleLguMapChange}
              />
              <div className="admin-fare-coords-display">
                <div>
                  <strong>Latitude:</strong>
                  <input type="text" value={lguDestination.latitude} placeholder="Latitude" readOnly />
                </div>
                <div>
                  <strong>Longitude:</strong>
                  <input type="text" value={lguDestination.longitude} placeholder="Longitude" readOnly />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="admin-fare-btn admin-fare-btn-primary"
              disabled={isSubmitting || !lguDestination.place}
            >
              <Icons.Check />
              {isSubmitting ? "Saving Destination..." : "Save Destination"}
            </button>
          </form>

          {/* --- Destination Management List --- */}
          <div className="admin-fare-list-section">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.Map />
              Manage Destinations
            </h3>
            <div className="admin-fare-field" style={{ marginBottom: '24px' }}>
              <label htmlFor="select-toda" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icons.Bus />
                Select TODA to View
              </label>
              <select
                id="select-toda"
                className="admin-fare-select"
                value={selectedToda}
                onChange={(e) => {
                  setSelectedToda(e.target.value);
                  setLguDestination((prev) => ({ ...prev, place: e.target.value }));
                }}
                disabled={isLoadingTerminals}
              >
                <option value="">-- Select a TODA --</option>
                {terminalsList.map((t) => (
                  <option key={t.id} value={t.association_name}>
                    {t.association_name}
                  </option>
                ))}
              </select>
            </div>

            {isLoadingDestinations ? (
              <p className="admin-fare-loading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icons.Loader className="spinner" />
                Loading destinations...
              </p>
            ) : destinationsList.length === 0 ? (
              <p className="admin-fare-empty">No destinations found for {selectedToda}</p>
            ) : (
              <ul className="admin-fare-list">
                {destinationsList.map((dest) => (
                  <li key={dest.id} className="admin-fare-list-item">
                    <div className="admin-fare-list-content">
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icons.MapPin />
                        {dest.location}
                      </h4>
                      <p>Fare: <strong>₱{parseFloat(dest.fare).toFixed(2)}</strong></p>
                    </div>
                    <button
                      type="button"
                      className="admin-fare-btn admin-fare-btn-danger"
                      onClick={() => handleDeleteDestination(dest.id)}
                    >
                      <Icons.Trash />
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* --- Section 4: Transfer Points --- */}
      {category === "TransferPoints" && (
        <div className="admin-fare-container">
          <form onSubmit={handleTransferPointSubmit} className="admin-fare-form">
            <div className="admin-fare-form-header">
              <div>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icons.MapPin />
                  Register New Transfer Point
                </h2>
                <p>Add a new transfer point (e.g., kanto, crossing) to the map</p>
              </div>
            </div>

            <div className="admin-fare-form-grid">
              <div className="admin-fare-field">
                <label htmlFor="point-name">Point Name</label>
                <input
                  id="point-name"
                  type="text"
                  name="name"
                  value={transferPoint.name}
                  onChange={handleTransferPointChange}
                  placeholder="e.g., Pulong Yantok Kanto"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="admin-fare-field">
                <label htmlFor="point-barangay">Barangay</label>
                <input
                  id="point-barangay"
                  type="text"
                  name="barangay"
                  value={transferPoint.barangay}
                  onChange={handleTransferPointChange}
                  placeholder="e.g., Pulong Buhangin"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="admin-fare-field">
                <label htmlFor="point-municipality">Municipality</label>
                <input
                  id="point-municipality"
                  type="text"
                  name="municipality"
                  value={transferPoint.municipality}
                  onChange={handleTransferPointChange}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="admin-fare-field admin-fare-field-full">
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icons.MapPin />
                Point Location
              </label>
              <p className="admin-fare-help-text" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icons.AlertCircle />
                Click on the map or drag the marker to set the point's exact coordinates
              </p>
              <TerminalMapPicker
                latitude={transferPoint.latitude}
                longitude={transferPoint.longitude}
                onLocationChange={handleTransferPointMapChange}
              />
              <div className="admin-fare-coords-display">
                <div>
                  <strong>Latitude:</strong>
                  <input type="text" value={transferPoint.latitude} placeholder="Latitude" readOnly />
                </div>
                <div>
                  <strong>Longitude:</strong>
                  <input type="text" value={transferPoint.longitude} placeholder="Longitude" readOnly />
                </div>
              </div>
            </div>

            <button type="submit" className="admin-fare-btn admin-fare-btn-primary" disabled={isSubmitting}>
              <Icons.Check />
              {isSubmitting ? "Saving Transfer Point..." : "Save New Transfer Point"}
            </button>
          </form>

          {/* --- Transfer Points Management List --- */}
          <div className="admin-fare-list-section">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Icons.Map />
              Manage Existing Transfer Points
            </h3>
            {isLoadingTransferPoints ? (
              <p className="admin-fare-loading" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icons.Loader className="spinner" />
                Loading transfer points...
              </p>
            ) : transferPointsList.length === 0 ? (
              <p className="admin-fare-empty">No transfer points found yet</p>
            ) : (
              <ul className="admin-fare-list">
                {transferPointsList.map((point) => (
                  <li key={point.id} className="admin-fare-list-item">
                    <div className="admin-fare-list-content">
                      <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icons.MapPin />
                        {point.name}
                      </h4>
                      <p>{point.barangay} • {point.municipality}</p>
                      <span className="admin-fare-list-meta">Coordinates: {point.latitude}, {point.longitude}</span>
                    </div>
                    <button
                      type="button"
                      className="admin-fare-btn admin-fare-btn-danger"
                      onClick={() => handleDeleteTransferPoint(point.id)}
                    >
                      <Icons.Trash />
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

export default AdminFareUpload;