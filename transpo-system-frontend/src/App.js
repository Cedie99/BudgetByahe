import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Navbar from './Navbar';
import Home from './Home';
import RoutesPage from './RoutesPage';
import Fares from './Fares';
import Login from './Login';
import Signup from './Signup';
import Profile from './Profile';
import Map from './Map';
import ResetPassword from './ResetPassword';
import ForgotPassword from './ForgotPassword';
import VerifyEmail from './VerifyEmail';
import ChatbotWidget from './components/ChatbotWidget';
import ProtectedRoute from './components/ProtectedRoute';
import { auth, onAuthStateChanged, db, doc, getDoc } from './firebase';


import RouteBuilder from './RouteBuilder';

// Admin Components
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import AdminRoutes from './admin/AdminRoutes';
import AdminCMS from './admin/AdminCMS';
import AdminFeedback from './admin/AdminFeedback';
import AdminFareUpload from './admin/AdminFareUpload';

function AppWithNavbar() {
  const location = useLocation();
  const hideNavbarPaths = ["/login", "/signup", "/reset-password", "/forgot-password", "/verify-email", "/__/auth/action", "/admin/login", "/admin/dashboard", "/admin/routes", "/admin/cms", "/admin/feedback", "/admin/fares"];
  const hideChatbotPaths = ["/login", "/signup", "/routes", "/reset-password", "/forgot-password", "/verify-email", "/__/auth/action", "/admin/login", "/admin/dashboard", "/admin/routes", "/admin/cms", "/admin/feedback", "/admin/fares"];
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
        <Route path="/routes" element={
          <ProtectedRoute>
            <RoutesPage />
          </ProtectedRoute>
        } /> 
        <Route path="/routeBuilder" element={<RouteBuilder />} />
        <Route path="/fares" element={<Fares />} />
        <Route path="/map" element={<Map />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/__/auth/action" element={<VerifyEmail />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/routes" element={<AdminRoutes />} />
        <Route path="/admin/cms" element={<AdminCMS />} />
        <Route path="/admin/feedback" element={<AdminFeedback />} />
        <Route path="/admin/feedback" element={<AdminFeedback />} />
        <Route path="/admin/fares" element={<AdminFareUpload />} />
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
