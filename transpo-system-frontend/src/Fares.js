import React, { useEffect, useState } from "react";
import "./Fares.css";
import Footer from './Footer.js'

// Define your API base URL
const API_URL = "http://127.0.0.1:8000/api";

function Fares() {
  // === NEW STATE ===
  const [ltfrb, setLtfrb] = useState({ data: [], uploadedAt: null });
  const [lguPlaces, setLguPlaces] = useState([]); // To store ["PB-GVMPTODA", "Bocaue TODA"]
  const [lguCache, setLguCache] = useState({}); // Cache for LGU data
  const [activeSelection, setActiveSelection] = useState("LTFRB"); // "LTFRB" or "PB-GVMPTODA", etc.
  
  const [isLoading, setIsLoading] = useState(true); // For initial page load
  const [isLoadingLgu, setIsLoadingLgu] = useState(false); // For LGU data fetching

  // === NEW: Initial data fetch (LTFRB + LGU Places) ===
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        // Fetch LTFRB data
        const ltfrbRes = await fetch(`${API_URL}/fares/LTFRB`);
        if (ltfrbRes.ok) {
          const ltfrbData = await ltfrbRes.json();
          setLtfrb(ltfrbData);
        } else {
          console.error("Failed to fetch LTFRB data");
          setLtfrb({ data: [], uploadedAt: new Date().toISOString() }); // Set empty data
        }

        // Fetch LGU places list
        // === FIX 1: Corrected this URL ===
        const lguPlacesRes = await fetch(`${API_URL}/lgu-places`);
        if (lguPlacesRes.ok) {
          const lguPlacesData = await lguPlacesRes.json();
          // Now lguPlacesData is correctly an array like ["Place1", "Place2"]
          setLguPlaces(lguPlacesData);
        } else {
          console.error("Failed to fetch LGU places");
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // === NEW: Fetch LGU data when activeSelection changes ===
  useEffect(() => {
    if (activeSelection === "LTFRB") {
      return; // Do nothing if LTFRB is selected
    }

    const fetchLguData = async () => {
      // Check cache first
      if (lguCache[activeSelection]) {
        return; // Data already in cache
      }

      setIsLoadingLgu(true);
      try {
        // === FIX 2: Corrected this URL (removed /LGU) ===
        const res = await fetch(`${API_URL}/fares/${activeSelection}`);
        if (res.ok) {
          const data = await res.json();
          // Cache the new data
          setLguCache(prevCache => ({
            ...prevCache,
            [activeSelection]: data
          }));
        } else {
          console.error(`Failed to fetch data for ${activeSelection}`);
          // Cache empty data to prevent re-fetching
          setLguCache(prevCache => ({
            ...prevCache,
            [activeSelection]: { data: [], uploadedAt: new Date().toISOString() }
          }));
        }
      } catch (error) {
        console.error(`Error fetching data for ${activeSelection}:`, error);
      } finally {
        setIsLoadingLgu(false);
      }
    };

    fetchLguData();
  }, [activeSelection, lguCache]);


  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      return dateString; // Fallback
    }
  };

  // === UPDATED: Helper function to render table ===
  // This function now adds CSS classes for you to style
  const renderTable = (data, selection) => {
    // Use the new ".no-data" style
    if (isLoadingLgu && selection !== "LTFRB") {
      return <div className="no-data">Loading data...</div>;
    }
    if (!data || data.length === 0) {
      return <div className="no-data">No fare data found for {selection}.</div>;
    }

    // 1. DEFINE COLUMNS TO HIDE
    const hiddenColumns = [
      'id',
      'terminal_id',
      'latitude',
      'longitude',
      'created_at',
      'updated_at',
      'place' // Hide 'place' since it's already in the title
    ];

    // 2. GET AND FILTER HEADERS
    const headers = Object.keys(data[0]);
    const filteredHeaders = headers.filter(header => !hiddenColumns.includes(header));

    return (
      <div className="fare-table-wrapper">
        <table className="fare-table">
          <thead className="fare-table-head">
            <tr>
              {filteredHeaders.map((key) => (
                <th key={key}>{key.replace(/_/g, ' ')}</th>
              ))}
            </tr>
          </thead>
          <tbody className="fare-table-body">
            {data.map((row, index) => (
              <tr key={index}>
                {filteredHeaders.map((key) => (
                  <td key={key}>{row[key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // --- Determine active data and title ---
  const activeData = activeSelection === "LTFRB"
    ? ltfrb
    : lguCache[activeSelection] || { data: [], uploadedAt: null };
  
  const activeTitle = activeSelection === "LTFRB"
    ? "Jeepney Fare Matrix"
    : `${activeSelection} Fare Matrix`;

  return (
    <>
      <div className="fares-container">
        <h2>Fare Matrix Guide</h2>
        <p className="matrix-p">
          Stay informed with the latest fare matrix updates.
          This guide provides transparent, up-to-date fare details for public transport services.
        </p>

        <div className="table-header">
          <div className="effective-date">
            Effective as of {isLoading ? 'Loading...' : formatDate(activeData.uploadedAt)}
          </div>

          {/* === NEW: Dynamic Select === */}
          <select
            className="fare-select"
            value={activeSelection}
            onChange={(e) => setActiveSelection(e.target.value)}
          >
            <option value="LTFRB">LTFRB Fare for Jeepney</option>
            {/* Map over the LGU places fetched from the API */}
            {lguPlaces.map(place => (
              <option key={place} value={place}>
                {place} TODA Fare Matrix
              </option>
            ))}
          </select>
        </div>

        <div className="fare-matrix">
          <h3 className="table-title">{activeTitle}</h3>
          
          {/* === NEW: Render Logic === */}
          {activeSelection === 'LTFRB' &&
            renderTable(ltfrb.data, "LTFRB")}
            
          {activeSelection !== 'LTFRB' &&
            renderTable(activeData.data, activeSelection)}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Fares;