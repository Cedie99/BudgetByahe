import React, { useState } from 'react';
import './Navbar.css';
import logo from './assets/bb-logo.png';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ whiteBackground }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate(); // Ensure you import useNavigate from 'react-router-dom'

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const mainFeature = (e) => {
    e.preventDefault();
    // close your menu logic here...
    navigate('/mainFeature'); // ✅ now it works
  };

  const home = (e) => {
    e.preventDefault();
    // close your menu logic here...
    navigate('/home'); // ✅ now it works
  };



  const handleSmoothScroll = (e, id) => {
  e.preventDefault(); // prevent default anchor behavior
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
    // remove the hash from the URL
    window.history.replaceState(null, '', window.location.pathname);
  }
  closeMenu();
};


  return (
    <nav className={`navbar ${whiteBackground ? 'white-bg' : ''}`}>
  <div className="logo-wrapper" onClick={(e) => handleSmoothScroll(e, 'main-section')}>
    <img src={logo} alt="Jeepney" className="brand-logo" />
    <h2 className="logo">Budget Byahe</h2>
  </div>
  
  <div className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
    <span></span>
    <span></span>
    <span></span>
  </div>
  
  <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
    <li><a href="#main-section" onClick={home}>HOME</a></li>
    <li><a href="#" onClick={mainFeature}>ROUTES</a></li>
    <li><a href="#" onClick={closeMenu}>FARES</a></li>
    <li><a href="#" onClick={closeMenu}>MAP</a></li>
    <li><button className="login" onClick={closeMenu}>LOGIN</button></li>
    <li><button className="signup" onClick={closeMenu}>SIGNUP</button></li>
  </ul>
</nav>

  );
};

export default Navbar;