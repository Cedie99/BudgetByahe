import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import jeepney from './assets/greenjeep.png'; // <- add the image to src/
import MapPhilippines from './MapPhilippines.js';
import peso from './assets/peso.png'; // <- add the peso image to src/
import route from './assets/route.png'; // <- add the route image to src/
import devices from './assets/devices.png'; // <- add the devices image to src/
import fb from './assets/fb.png'; // <- add the fb image to src/
import ig from './assets/insta.png'; // <- add the ig image to src/
import gmail from './assets/gmail.png'; // <- add the gmail image to src/
import HeroSection from './HeroSection.js';
import search from './assets/search.png'; // <- add the search image to src/
import bgImages from './assets/bb-logo.png'; // <- add the background image to src/
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainFeature from './MainFeature.js'; // <- add the MainFeature component

function Home() {
  const [whiteNavbar, setWhiteNavbar] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
  const handleScroll = () => {
    const aboutSection = document.getElementById('about-us');
    const chooseUsSection = document.querySelector('.choose-us');
    const scrollY = window.scrollY + 80; // buffer for fixed navbar

    if (aboutSection && chooseUsSection) {
      const aboutTop = aboutSection.offsetTop;
      const chooseUsTop = chooseUsSection.offsetTop;

      if (scrollY >= aboutTop && scrollY < chooseUsTop) {
        setWhiteNavbar(true); // White during About Us
      } else {
        setWhiteNavbar(false); // Black elsewhere
      }
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);


  return (
    <div className="container">
      <main className="main-section" id='main-section'>
        <div className="content">
          <div className='bg-images'>
            <img src={bgImages} alt="Background" className="bg-image top-right" />
            <img src={bgImages} alt="Background" className="bg-image bottom-left" />
          </div>
          <div className="content" id="dynamicContent">
            <HeroSection/>
          </div>
                      <button
                        className="find-route-button"
                        onClick={() => {
                          navigate('/mainFeature');
                        }}
                        >
                        <img
                          src={search}
                          alt="Search"
                          style={{ width: '22px', height: '22px', marginRight: '8px', verticalAlign: 'middle' }}
                        />
                        Find Route
                      </button>
        </div>
      </main>

      <section className="about-us" id='about-us'>
        <div className="about-us-content">
          <div className="about-text">
            <h1>About <span>Budget Byahe</span></h1>
            <p>
              At Budget Byahe, our mission is to make commuting <span>smarter, faster, and more cost-efficient. </span> 
              We provide an easy-to-use platform that helps users find the best routes and calculate 
              travel fares across various modes of transportation.
            </p>
            <div className='icons'>
              <img src={fb} alt="Route" className="fb-image" />
              <img src={gmail} alt="Route" className="gmail-image" />
              <img src={ig} alt="Route" className="ig-image" />
             </div>
          </div>
          <div className="about-us-image">
              <MapPhilippines />
          </div>
        </div>
      </section>

      <section className='choose-us' id='choose-us'>
        <h1>3 Reasons to Choose Us</h1>
        <div className="reasons-container">
          <div className='reason-1'>
            <h2>Accurate Fare Calculations</h2>
            <img src={peso} alt="Peso" className="peso-image" />
            <p>Provides accurate fare estimates based on official rates from the LTFRB and local government units (LGUs).</p>
          </div>
          <div className='reason-2'>
            <h2>Smart Route Suggestions</h2>
            <img src={route} alt="Route" className="route-image" />
            <p>Budget Byahe helps users discover the most efficient routes, saving both time and energy with smart, hassle-free navigation.</p>
          </div>
          <div className='reason-3'>
            <h2>User-Friendly Interface</h2>
            <img src={devices} alt="Devices" className="devices-image" />
            <p>Offers an intuitive interface and a fully responsive design that looks great on all devices — from desktops to smartphones.</p>
          </div>
        </div>
      </section>

      <footer className="footer">
  <div className="footer-content">
    <div className="footer-brand">
      <h2 className="brand-title">
        <span className="brand-name">Budget Byahe</span> — Your Smart Travel Companion
      </h2>
    </div>

    <div className="footer-section">
      <h3 className="section-title">Quick Links</h3>
      <nav className="footer-links" aria-label="Quick Links">
        <a href="#" className="footer-link">Home</a>
        <a href="#about-us" className="footer-link">About Us</a>
        <a href="#" className="footer-link">Features</a>
        <a href="#" className="footer-link">Terms and Conditions</a>
        <a href="#" className="footer-link">Privacy and Policy</a>
      </nav>
    </div>

    <div className="footer-section">
      <h3 className="section-title">Contact Information</h3>
      <address className="contact-info">
        <div className="contact-item">Email: <a href="mailto:support@navica.com" className="footer-link">support@BudgetByahe.com</a></div>
        <div className="contact-item">Phone: <a href="tel:+639001234567" className="footer-link">+63 900 123 4567</a></div>
        <div className="contact-item">Address: 123 Commuter Lane, Metro Manila, Philippines</div>
      </address>
    </div>
  </div>

  <div className="footer-bottom">
    <div className="copyright">Copyright</div>
    <div className="copyright-text">© 2025 Budget Byahe. All rights reserved.</div>
  </div>
</footer>


    </div>
  );
}

export default Home;
