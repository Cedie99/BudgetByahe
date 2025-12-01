import React, { useState, useEffect } from "react";
import "./Navbar.css";
import logo from "./assets/bb-logo.png";
import { NavLink, useNavigate } from "react-router-dom";
import { auth, signOut } from "./firebase";
import useCMS from './hooks/useCMS';

const Navbar = ({ whiteBackground }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userFirstName, setUserFirstName] = useState("");
  const [userProfilePicture, setUserProfilePicture] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { cmsData, loading, error } = useCMS();

  useEffect(() => {
    // Check if user is logged in on component mount
    const checkAuthStatus = () => {
      const authStatus = localStorage.getItem("auth");
      const firstName = localStorage.getItem("userFirstName");
      const profilePicture = localStorage.getItem("userProfilePicture");
      
      if (authStatus === "true" && firstName) {
        setIsLoggedIn(true);
        setUserFirstName(firstName);
        setUserProfilePicture(profilePicture || "");
      } else {
        setIsLoggedIn(false);
        setUserFirstName("");
        setUserProfilePicture("");
      }
    };

    // Check on mount
    checkAuthStatus();

    // Listen for storage changes (triggered from App.js auth state listener)
    window.addEventListener('storage', checkAuthStatus);

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
    };
  }, []);

  const login = () => {
    localStorage.setItem("auth", "true");
    navigate("/login");
  };

  const signup = () => {
    closeMenu();
    navigate("/signup");
  };

  const logout = async () => {
    try {
      await signOut(auth);
      // Clear all user data from localStorage
      localStorage.removeItem("auth");
      localStorage.removeItem("firebase_id_token");
      localStorage.removeItem("userFirstName");
      localStorage.removeItem("userLastName");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userId");
      localStorage.removeItem("userProfilePicture");
      
      setIsLoggedIn(false);
      setUserFirstName("");
      closeMenu();
      navigate("/home");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const closeDropdown = () => setShowDropdown(false);

  const goToProfile = () => {
    closeDropdown();
    closeMenu();
    navigate("/profile");
  };

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
          <img 
            src={cmsData.navbarLogo && cmsData.navbarLogo.trim() !== '' ? cmsData.navbarLogo : logo} 
            alt={cmsData.navbarBrand || "Budget Byahe"} 
            className="brand-logo" 
          />
          <a><h2 className="brand-name">{cmsData.navbarBrand || 'Budget Byahe'}</h2></a>
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
              end
              className={({ isActive }) => {
                // Also check if we're at root path "/"
                const isRootPath = window.location.pathname === "/";
                return (isActive || isRootPath) ? "active-link" : "";
              }}
              onClick={(e) => {
                closeMenu();

                if (window.location.pathname === "/home" || window.location.pathname === "/") {
                  // If already on home, just scroll
                  e.preventDefault();
                  const el = document.getElementById("landing");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/routes"
              end
              className={({ isActive }) => (isActive ? "active-link" : "")}
              onClick={closeMenu}
            >
              Routes
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/fares"
              end
              className={({ isActive }) => (isActive ? "active-link" : "")}
              onClick={closeMenu}
            >
              Fares
            </NavLink>
          </li>
          <li>
            <NavLink 
              to="/map"
              end
              className={({ isActive }) => (isActive ? "active-link" : "")}
              onClick={closeMenu}
            >
              Map
            </NavLink>
          </li>
          {isLoggedIn ? (
            <>
              <li className="user-dropdown-wrapper">
                <button 
                  className="user-profile-section" 
                  onClick={toggleDropdown}
                  onBlur={() => setTimeout(closeDropdown, 200)}
                >
                  <div className="user-avatar">
                    {userProfilePicture ? (
                      <img src={userProfilePicture} alt="Profile" className="user-avatar-img" />
                    ) : (
                      userFirstName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="user-greeting">Hi, {userFirstName}!</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    strokeWidth={2} 
                    stroke="currentColor" 
                    className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                
                {showDropdown && (
                  <div className="user-dropdown-menu">
                    <button className="dropdown-item" onClick={goToProfile}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      View Profile
                    </button>
                    <button className="dropdown-item logout-item" onClick={logout}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </li>
            </>
          ) : (
            <>
              <li>
                <button className="btn-login" onClick={login}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="login-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  Login
                </button>
              </li>
              <li>
                <button className="btn-signup" onClick={signup}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="signup-icon">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                  </svg>
                  Sign Up
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;