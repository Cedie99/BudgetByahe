import React, { useState } from 'react';
import './Navbar.css';
import logo from './assets/bb-logo.png';
import { NavLink } from 'react-router-dom';

const Navbar = ({ whiteBackground }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className={`navbar ${whiteBackground ? 'white-bg' : ''}`}>
      <div className="logo-wrapper" onClick={closeMenu}>
        <img src={logo} alt="Jeepney" className="brand-logo" />
        <h2 className="logo">Budget Byahe</h2>
      </div>
      
      <div className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      
      <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
        <li>
          <NavLink 
            to="/home" 
            className={({ isActive }) => (isActive ? "active-link" : "")}
            onClick={closeMenu}
          >
            HOME
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/mainFeature" 
            className={({ isActive }) => (isActive ? "active-link" : "")}
            onClick={closeMenu}
          >
            ROUTES
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/fares" 
            className={({ isActive }) => (isActive ? "active-link" : "")}
            onClick={closeMenu}
          >
            FARES
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/map" 
            className={({ isActive }) => (isActive ? "active-link" : "")}
            onClick={closeMenu}
          >
            MAP
          </NavLink>
        </li>
        <li>
          <button className="login" onClick={closeMenu}>LOGIN</button>
        </li>
        <li>
          <button className="signup" onClick={closeMenu}>SIGNUP</button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
