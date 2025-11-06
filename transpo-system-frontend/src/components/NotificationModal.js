import React, { useEffect, useState, useRef } from "react";
// Using Feather icons — they are very clean and modern
import {
  FiCheckCircle,
  FiInfo,
  FiAlertTriangle,
  FiX,
} from "react-icons/fi";
import "./NotificationModal.css";

// Helper object to map types to icons
const ICONS = {
  success: <FiCheckCircle size={24} />,
  info: <FiInfo size={24} />,
  error: <FiAlertTriangle size={24} />,
};

// Helper object to map types to titles
const TITLES = {
  success: "Success",
  info: "Information",
  error: "Error Occurred",
};

function NotificationModal({ type = "info", message, onClose }) {
  const [isExiting, setIsExiting] = useState(false);
  const timerRef = useRef(null);

  // This wrapper function handles the exit animation
  const handleClose = () => {
    // 1. Clear the auto-close timer if it's running
    clearTimeout(timerRef.current);
    
    // 2. Trigger the exit animation
    setIsExiting(true);
    
    // 3. Wait for the animation to finish (300ms) before calling onClose
    setTimeout(() => {
      onClose();
    }, 300);
  };

  // useEffect for the 5-second auto-close timer
  useEffect(() => {
    timerRef.current = setTimeout(handleClose, 5000);

    // Clear timer if the component unmounts (e.g., user navigates away)
    return () => {
      clearTimeout(timerRef.current);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // useEffect to listen for the 'Escape' key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    
    // Cleanup the event listener on unmount
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // Also runs only once

  const icon = ICONS[type];
  const title = TITLES[type];

  return (
    // The overlay closes the modal on click
    <div
      className="notification-overlay"
      onClick={handleClose}
      role="alertdialog"
      aria-labelledby="notification-header"
      aria-describedby="notification-body"
    >
      {/* We stop propagation here so that clicking *on* the modal 
        doesn't trigger the overlay's onClick
      */}
      <div
        className={`notification-modal ${type} ${isExiting ? "exiting" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Icon Wrapper */}
        <div className="notification-icon-wrapper">
          {icon}
        </div>

        {/* 2. Content Wrapper */}
        <div className="notification-content">
          <div id="notification-header" className="notification-header">
            {title}
          </div>
          <div id="notification-body" className="notification-body">
            {message}
          </div>
        </div>

        {/* 3. Close Button */}
        <button className="notification-close-btn" onClick={handleClose}>
          <FiX size={20} />
        </button>

        {/* 4. Visual Timer Bar */}
        <div className="notification-timer-bar"></div>
      </div>
    </div>
  );
}

export default NotificationModal;