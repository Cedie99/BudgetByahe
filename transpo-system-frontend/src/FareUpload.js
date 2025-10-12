import React, { useState, useRef } from "react";
import Papa from "papaparse";
import * as pdfjsLib from "pdfjs-dist";
import "./FareUpload.css";


pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function FareUpload() {
  const [fileName, setFileName] = useState("");
  const [category, setCategory] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileProcess = async (file) => {
    if (!file) return;

    if (!category) {
      alert("Please select a category (LTFRB or LGU) before uploading.");
      return;
    }

    setFileName(file.name);
    const storageKey =
      category === "LTFRB" ? "uploadedData_LTFRB" : "uploadedData_LGU";

    const uploadAt = new Date().toISOString();

    // ✅ CSV upload
    if (file.type === "text/csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const fileData = {
            uploadedAt: uploadAt,
            data: result.data,
          };
          localStorage.setItem(storageKey, JSON.stringify(fileData));
          alert(`${category} CSV uploaded successfully! View it in the Fares page.`);
        },
      });
    }

    // ✅ PDF upload
    else if (file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = async function () {
        const pdfData = new Uint8Array(this.result);
        const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

        let textContent = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const text = await page.getTextContent();
          const textItems = text.items.map((item) => item.str).join(" ");
          textContent.push(textItems);
        }

        const pdfRows = textContent.map((text, i) => ({
          Page: i + 1,
          Content: text,
        }));

        const fileData = {
          uploadedAt: uploadAt,
          data: pdfRows,
        };

        localStorage.setItem(storageKey, JSON.stringify(fileData));
        alert(`${category} PDF uploaded successfully! View it in the Fares page.`);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Please upload only PDF or CSV files.");
    }
  };

  const handleFileChange = (e) => handleFileProcess(e.target.files[0]);
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileProcess(file);
  };

  return (
    <div className="page-center">
      <div className="fare-upload-container">
        <h2>Admin Fare Upload</h2>
        <p className="description">
          Upload fare matrix files here to keep LTFRB and LGU fare rates up to date for all users.
        </p>

        <div className="fare-upload-field">
          <label>Select Category:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="fare-upload-select"
          >
            <option value="">-- Choose Category --</option>
            <option value="LTFRB">LTFRB</option>
            <option value="LGU">LGU</option>
          </select>
        </div>

        {/* DRAG & DROP ZONE */}
        <div
          className={`drag-drop-zone ${isDragging ? "dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <p>
            {isDragging
              ? "Drop the file here..."
              : "Drag & drop a PDF or CSV file here, or click to browse"}
          </p>
        </div>

        <input
          type="file"
          accept=".csv,.pdf"
          onChange={handleFileChange}
          className="fare-upload-input"
          ref={fileInputRef}
          style={{ display: "none" }}
        />

        {fileName && <p className="uploaded-file">Uploaded: {fileName}</p>}
      </div>
    </div>
  );
}

export default FareUpload;
