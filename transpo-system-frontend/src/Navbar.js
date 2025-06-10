import React, { useState } from 'react';
import './Navbar.css';

const Navbar = ({ whiteBackground }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
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
      <h2 className="logo" onClick={(e) => handleSmoothScroll(e, 'main-section')}>Budget Byahe</h2>
      
      <div className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      
      <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
        <li><a href="#main-section" onClick={(e) => handleSmoothScroll(e, 'main-section')}>HOME</a></li>
        <li><a href="#" onClick={closeMenu}>ROUTES</a></li>
        <li><a href="#" onClick={closeMenu}>FARES</a></li>
        <li><a href="#" onClick={closeMenu}>SCHEDULES</a></li>
        <li><button className="login" onClick={closeMenu}>LOGIN</button></li>
        <li><button className="signup" onClick={closeMenu}>SIGNUP</button></li>
      </ul>
    </nav>
  );
};

export default Navbar;