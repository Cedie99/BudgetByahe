import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './Navbar';
import Home from './Home';
import MainFeature from './MainFeature';
import FareUpload from './FareUpload';
import Fares from './Fares';
import Login from './Login';
import Signup from './Signup';

function AppWithNavbar() {
  const location = useLocation();
  const hideNavbarPaths = ["/login", "/signup"];
  const showNavbar = !hideNavbarPaths.includes(location.pathname);

  useEffect(() => {
    if (!hideNavbarPaths.includes(location.pathname)) {
      localStorage.setItem("lastPage", location.pathname);
    }
  }, [location.pathname]);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />  
        <Route path="/home" element={<Home />} />
        <Route path="/mainFeature" element={<MainFeature />} /> 
        <Route path="/fareupload" element={<FareUpload />} />
        <Route path="/fares" element={<Fares />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppWithNavbar />
    </Router>
  );
}
