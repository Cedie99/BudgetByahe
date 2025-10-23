import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";
import googleLogo from "./assets/google_logo.png";
import fbLogo from "./assets/fb_logo_white.png";
import bbLogo from "./assets/bb-logo.png";

import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  facebookProvider,
  doc,
  setDoc,
} from "./firebase";

import NotificationModal from './components/NotificationModal';

function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  
  // Notification modal state
  const [showNotif, setShowNotif] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('success');
  // popup guard
  const [popupInProgress, setPopupInProgress] = useState(false);
  // Loading states for social login buttons
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  
  let lastPage = localStorage.getItem("lastPage") || "/";
  let backLabel = "Previous Page";

  if (lastPage === "/") backLabel = "Home";
  else if (lastPage.includes("home")) backLabel = "Home";
  else if (lastPage.includes("mainFeature")) backLabel = "Routes";
  else if (lastPage.includes("fare")) backLabel = "Fares";
  else if (lastPage.includes("map")) backLabel = "Map";

  // --- EMAIL & PASSWORD SIGNUP ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create account in Firebase Auth
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      // Save user profile to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        email,
        createdAt: new Date(),
        provider: "password",
      });

      // Store user data in localStorage
      localStorage.setItem('userFirstName', firstName);
      localStorage.setItem('userLastName', lastName);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userId', user.uid);

      // Store login token locally
      const idToken = await user.getIdToken();
      localStorage.setItem("auth", "true");
      localStorage.setItem("firebase_id_token", idToken);

      setNotifType('success');
      setNotifMessage('Signed up successfully');
      setShowNotif(true);
    } catch (error) {
      
      let errorMsg = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMsg = 'This email is already registered. Please log in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMsg = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address.';
      }
      
      setNotifType('error');
      setNotifMessage(errorMsg);
      setShowNotif(true);
    }
  };

  // --- GOOGLE SIGNUP ---
  const handleGoogle = async () => {
    if (popupInProgress) {
      return;
    }
    
    setPopupInProgress(true);
    setGoogleLoading(true);
    
    // Safety timeout to reset loading state after 10 seconds
    const timeoutId = setTimeout(() => {
      setGoogleLoading(false);
      setPopupInProgress(false);
    }, 10000);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      clearTimeout(timeoutId);
      const user = result.user;

      // Save Google user to Firestore
      const firstName = user.displayName?.split(" ")[0] || "";
      const lastName = user.displayName?.split(" ")[1] || "";
      
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        email: user.email,
        photoURL: user.photoURL,
        provider: "google",
        createdAt: new Date(),
      });

      // Store user data in localStorage
      localStorage.setItem('userFirstName', firstName);
      localStorage.setItem('userLastName', lastName);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userId', user.uid);

      const idToken = await user.getIdToken();
      localStorage.setItem("auth", "true");
      localStorage.setItem("firebase_id_token", idToken);

      setNotifType('success');
      setNotifMessage('Signed up successfully');
      setShowNotif(true);
    } catch (error) {
      clearTimeout(timeoutId);
      let errorMsg = 'Google signup failed. Please try again.';
      
      // Check for popup cancellation
      if (error.code === 'auth/popup-closed-by-user') {
        errorMsg = 'You closed the signup popup. Click the button again to try signing up.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMsg = 'The signup process was cancelled.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMsg = 'Popup was blocked. Please allow popups and try again.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMsg = 'An account already exists with this email using a different sign-in method.';
      } else if (error.code === 'permission-denied') {
        errorMsg = 'Unable to save your profile. Please contact support.';
      }
      
      // Always show notification on error
      setNotifType('error');
      setNotifMessage(errorMsg);
      setShowNotif(true);
    } finally {
      clearTimeout(timeoutId);
      setPopupInProgress(false);
      setGoogleLoading(false);
    }
  };

  // --- FACEBOOK SIGNUP ---
  const handleFacebook = async () => {
    if (popupInProgress) {
      return;
    }
    
    setPopupInProgress(true);
    setFacebookLoading(true);

    // Safety timeout to reset loading state after 10 seconds
    const timeoutId = setTimeout(() => {
      setFacebookLoading(false);
      setPopupInProgress(false);
    }, 10000);
    
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      clearTimeout(timeoutId);
      const user = result.user;

      // Save Facebook user to Firestore
      const firstName = user.displayName?.split(" ")[0] || "";
      const lastName = user.displayName?.split(" ")[1] || "";
      
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        email: user.email,
        photoURL: user.photoURL,
        provider: "facebook",
        createdAt: new Date(),
      });

      // Store user data in localStorage
      localStorage.setItem('userFirstName', firstName);
      localStorage.setItem('userLastName', lastName);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userId', user.uid);

      const idToken = await user.getIdToken();
      localStorage.setItem("auth", "true");
      localStorage.setItem("firebase_id_token", idToken);

      setNotifType('success');
      setNotifMessage('Signed up successfully');
      setShowNotif(true);
    } catch (error) {
      clearTimeout(timeoutId);
      let errorMsg = 'Facebook signup failed. Please try again.';
      
      // Check for popup cancellation
      if (error.code === 'auth/popup-closed-by-user') {
        errorMsg = 'You closed the signup popup. Click the button again to try signing up.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMsg = 'The signup process was cancelled.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMsg = 'Popup was blocked. Please allow popups and try again.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMsg = 'An account already exists with this email using a different sign-in method.';
      } else if (error.code === 'permission-denied') {
        errorMsg = 'Unable to save your profile. Please contact support.';
      }
      
      // Always show notification on error
      setNotifType('error');
      setNotifMessage(errorMsg);
      setShowNotif(true);
    } finally {
      clearTimeout(timeoutId);
      setPopupInProgress(false);
      setFacebookLoading(false);
    }
  };

  return (
    <>
    <div className="auth-page">
      <div className="auth-card">
        <button
          className="back-home-btn"
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: 'none',
            border: 'none',
            color: '#0d7a49',
            cursor: 'pointer',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onClick={() => navigate(lastPage)}
        >
          <svg xmlns="http://www.w3.org/2000/svg"
               fill="none"
               viewBox="0 0 24 24"
               strokeWidth={2}
               stroke="currentColor"
               style={{ width: '16px', height: '16px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to {backLabel}
        </button>
        <div className="auth-left">
          <h2 className="auth-title">Create account</h2>
          <p className="auth-subtext">
            Sign up to save routes, receive fare alerts, and get the best commute suggestions.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="name-row">
              <input
                className="auth-input"
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                className="auth-input"
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <input
              className="auth-input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="auth-input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="auth-actions auth-actions-centered">
              <button className="btn-primary" type="submit">
                Sign Up
              </button>
            </div>

            <div style={{ marginTop: 12, textAlign: "center" }}>
              <span style={{ color: "#666" }}>Already have an account? </span>
              <Link to="/login" style={{ color: "#0d7a49", fontWeight: 600 }}>
                Log in
              </Link>
            </div>

            <div className="or-divider">
              <span></span>
              <strong>or</strong>
              <span></span>
            </div>

            <div className="social-label">sign up with</div>

            <div className="social-row">
              <button
                type="button"
                className="social-btn social-google"
                onClick={handleGoogle}
                disabled={googleLoading || facebookLoading}
                aria-label="Sign up with Google"
              >
                {googleLoading ? (
                  <div className="auth-spinner"></div>
                ) : (
                  <img src={googleLogo} alt="Google" style={{ width: 22, height: 22 }} />
                )}
              </button>
              <button
                type="button"
                className="social-btn social-fb"
                onClick={handleFacebook}
                disabled={googleLoading || facebookLoading}
                aria-label="Sign up with Facebook"
              >
                {facebookLoading ? (
                  <div className="auth-spinner"></div>
                ) : (
                  <img src={fbLogo} alt="Facebook" style={{ width: 20, height: 20 }} />
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="auth-right">
          <img src={bbLogo} alt="Budget Byahe" className="brand-logo-panel" />
          <h3>Start Smart Commutes</h3>
          <p>
            Join thousands who already use Budget Byahe to plan their trips and pay fair fares. We
            protect your data and make commuting simple.
          </p>
          <div
            className="auth-footer-link"
            onClick={() => (window.location.href = "/")}
          >
            Read about our data sources
          </div>
        </div>
      </div>
    </div>
      {showNotif && (
        <NotificationModal
          type={notifType}
          message={notifMessage}
          onClose={() => {
            setShowNotif(false);
            if (notifType === 'success') navigate('/login');
          }}
        />
      )}
    </>
  );
}

export default Signup;
