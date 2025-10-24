import React, { useEffect } from "react";
import "./NotificationModal.css";

function NotificationModal({ type, message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => {
      clearTimeout(timer);
    };
  }, [onClose]);


  const getHeader = () => {
    if (type === "success") return "✅ Success";
    if (type === "info") return "ℹ️ Info";
    return "⚠️ Error";
  };

  return (
    <div className="notification-overlay">
      <div className={`notification-modal ${type}`}>
        <div className="notification-header">
          {getHeader()}
        </div>
        <div className="notification-body">{message}</div>
        <button className="notification-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}

export default NotificationModal;
