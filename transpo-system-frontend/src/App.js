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
import Profile from './Profile';
import ChatbotWidget from './components/ChatbotWidget';
import { auth, onAuthStateChanged, db, doc, getDoc } from './firebase';

function AppWithNavbar() {
  const location = useLocation();
  const hideNavbarPaths = ["/login", "/signup"];
  const hideChatbotPaths = ["/login", "/signup", "/mainFeature"];
  const showNavbar = !hideNavbarPaths.includes(location.pathname);
  const showChatbot = !hideChatbotPaths.includes(location.pathname);

  useEffect(() => {
    if (!hideNavbarPaths.includes(location.pathname)) {
      localStorage.setItem("lastPage", location.pathname);
    }
  }, [location.pathname]);

  // Auth state persistence
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        const idToken = await user.getIdToken();
        localStorage.setItem('auth', 'true');
        localStorage.setItem('firebase_id_token', idToken);
        localStorage.setItem('userId', user.uid);
        
        // Fetch user data from Firestore if not in localStorage
        if (!localStorage.getItem('userFirstName')) {
          try {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              localStorage.setItem('userFirstName', userData.firstName || '');
              localStorage.setItem('userLastName', userData.lastName || '');
              localStorage.setItem('userEmail', userData.email || user.email);
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
        }
        
        // Trigger navbar update by dispatching a custom event
        window.dispatchEvent(new Event('storage'));
      } else {
        // User is signed out
        localStorage.removeItem('auth');
        localStorage.removeItem('firebase_id_token');
        localStorage.removeItem('userFirstName');
        localStorage.removeItem('userLastName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userId');
        
        // Trigger navbar update
        window.dispatchEvent(new Event('storage'));
      }
    });

    return () => unsubscribe();
  }, []);

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
        <Route path="/profile" element={<Profile />} />
      </Routes>
      {showChatbot && <ChatbotWidget />}
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
