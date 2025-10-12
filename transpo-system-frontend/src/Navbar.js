import React, { useState } from "react";
import "./Navbar.css";
import logo from "./assets/bb-logo.png";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar = ({ whiteBackground }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const login = () => {
    localStorage.setItem("auth", "true");
    navigate("/mainFeature");
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className={`navbar ${whiteBackground ? "white-bg" : ""}`}>
      <div className="navbar-container">
        <div
          className="logo-section"
          onClick={() => {
            if (window.location.pathname === "/home") {              
              const el = document.getElementById("landing");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            } else {
              navigate("/home");
              setTimeout(() => {
                const el = document.getElementById("landing");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }, 400);
            }
          }}
        >
          <img src={logo} alt="Budget Byahe" className="brand-logo" />
          <a><h2 className="brand-name">Budget Byahe</h2></a>
        </div>


        <div
          className={`menu-toggle ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

        <ul className={`nav-links ${isMenuOpen ? "active" : ""}`}>
          <li>
            <NavLink
              to="/home"
              onClick={(e) => {
                e.preventDefault(); // stop default navigation for a moment
                closeMenu();

                if (window.location.pathname === "/home") {
                  // If already on home, just scroll
                  const el = document.getElementById("landing");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                } else {
                  // If on another page, navigate then scroll
                  window.location.href = "/home";

                  // Delay scrolling slightly to ensure page loads first
                  setTimeout(() => {
                    const el = document.getElementById("landing");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }, 400);
                }
              }}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/mainFeature" onClick={closeMenu}>
              Routes
            </NavLink>
          </li>
          <li>
            <NavLink to="/fares" onClick={closeMenu}>
              Fares
            </NavLink>
          </li>
          <li>
            <NavLink to="/map" onClick={closeMenu}>
              Map
            </NavLink>
          </li>
          <li>
            <button className="btn-login" onClick={login}>
              Login
            </button>
          </li>
          <li>
            <button className="btn-signup" onClick={closeMenu}>
              Sign Up
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;