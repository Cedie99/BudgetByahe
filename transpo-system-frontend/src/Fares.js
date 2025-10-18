import React, { useEffect, useState } from "react";
import { FaBus, FaCity } from "react-icons/fa";
import "./Fares.css";
import Footer from './Footer.js'

function Fares() {
  const [ltfrb, setLtfrb] = useState({ data: [], uploadedAt: null });
  const [lgu, setLgu] = useState({ data: [], uploadedAt: null });
  const [activeTab, setActiveTab] = useState("LTFRB");

  useEffect(() => {
    const ltfrbStored = localStorage.getItem("uploadedData_LTFRB");
    const lguStored = localStorage.getItem("uploadedData_LGU");

    if (ltfrbStored) setLtfrb(JSON.parse(ltfrbStored));
    if (lguStored) setLgu(JSON.parse(lguStored));
  }, []);

  const formatDate = (isoDate) => {
  if (!isoDate) return "";
  const date = new Date(isoDate);
  return date.toLocaleString("en-US", {
    month: "long",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

  const renderTable = (tableData, title, uploadedAt) => {
    if (!tableData || tableData.length === 0)
      return <p className="no-data">No {title} data uploaded yet.</p>;

    const keys = Object.keys(tableData[0]);

    return (
      <div className="fares-table-wrapper">
        <div className="effective-date">
          Effective as of {formatDate(uploadedAt)}
        </div>
        <table className="fares-table">
          <thead>
            <tr>
              {keys.map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, i) => (
              <tr key={i}>
                {keys.map((key) => (
                  <td key={key}>{row[key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="container">
        <div className="fares-container">
                <h2>Fare Matrix Guide</h2>
                    <p className="matrix-p">Stay informed with the latest fare matrix updates for both LTFRB and LGU-regulated routes. This guide provides transparent, up-to-date fare details for 
                    public transport services — ensuring passengers and operators have easy access to accurate fare information anytime.</p>
                <div className="fares-tabs">
            <button
                className={`tab-btn ${activeTab === "LTFRB" ? "active" : ""}`}
                onClick={() => setActiveTab("LTFRB")}
            >
                <FaBus className="tab-icon" /> LTFRB
            </button>
            <button
                className={`tab-btn ${activeTab === "LGU" ? "active" : ""}`}
                onClick={() => setActiveTab("LGU")}
            >
                <FaCity className="tab-icon" /> LGU
            </button>
        </div>
            <div className="tab-content">
                {activeTab === "LTFRB" &&
                renderTable(ltfrb.data, "LTFRB", ltfrb.uploadedAt)}
                {activeTab === "LGU" && renderTable(lgu.data, "LGU", lgu.uploadedAt)}
            </div>
        </div>
        <Footer/>
    </div>
  );
}

export default Fares;
