import React, { useState, useEffect } from 'react';
import './App.css';
import jeepney from './assets/greenjeep.png'; // <- add the image to src/
import MapPhilippines from './MapPhilippines.js';
import peso from './assets/peso.png'; // <- add the peso image to src/
import route from './assets/route.png'; // <- add the route image to src/
import devices from './assets/devices.png'; // <- add the devices image to src/
import Navbar from './Navbar.js';
import fb from './assets/fb.png'; // <- add the fb image to src/
import ig from './assets/insta.png'; // <- add the ig image to src/
import gmail from './assets/gmail.png'; // <- add the gmail image to src/
import HeroSection from './HeroSection.js';
import search from './assets/search.png'; // <- add the search image to src/
import bgImages from './assets/bb-logo.png'; // <- add the background image to src/
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainFeature from './MainFeature.js'; // <- add the MainFeature component
import Home from './Home.js'; // <- add the Home component

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />  
        <Route path="/home" element={<Home />} />
        <Route path="/mainFeature" element={<MainFeature />} />
      </Routes>
    </Router>
  );
}

export default App;