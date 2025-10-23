import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';
import googleLogo from './assets/google_logo.png';
import fbLogo from './assets/fb_logo_white.png';
import bbLogo from './assets/bb-logo.png';

import {
  auth,
  db,
  signInWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  facebookProvider,
  doc,
  setDoc,
} from "./firebase";

import NotificationModal from './components/NotificationModal';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Notification modal state
  const [showNotif, setShowNotif] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('success');
  // popup guard
  const [popupInProgress, setPopupInProgress] = useState(false);

  let lastPage = localStorage.getItem("lastPage") || "/";
  let backLabel = "Previous Page";

  if (lastPage === "/") backLabel = "Home";
  else if (lastPage.includes("home")) backLabel = "Home";
  else if (lastPage.includes("mainFeature")) backLabel = "Routes";
  else if (lastPage.includes("fare")) backLabel = "Fares";
  else if (lastPage.includes("map")) backLabel = "Map";

  // --- Email & Password Login ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCred.user.getIdToken();

      localStorage.setItem('auth', 'true');
      localStorage.setItem('firebase_id_token', idToken);

      // show success notification then navigate when modal closes
      setNotifType('success');
      setNotifMessage('Logged in successfully');
      setShowNotif(true);
    } catch (error) {
      let errorMsg = 'An error occurred. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMsg = 'No account found with this email. Please sign up first.';
      } else if (error.code === 'auth/wrong-password') {
        errorMsg = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email address.';
      } else if (error.code === 'auth/user-disabled') {
        errorMsg = 'This account has been disabled.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMsg = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMsg = 'Invalid email or password. Please check and try again.';
      }
      
      setNotifType('error');
      setNotifMessage(errorMsg);
      setShowNotif(true);
    }
  };

  // --- Google Login ---
  const handleGoogle = async () => {
    if (popupInProgress) return;
    setPopupInProgress(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Save Google user to Firestore (or update if exists)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ")[1] || "",
        email: user.email,
        photoURL: user.photoURL,
        provider: "google",
        lastLogin: new Date(),
      }, { merge: true }); // merge: true will update if exists, create if not

      const idToken = await user.getIdToken();
      localStorage.setItem("auth", "true");
      localStorage.setItem("firebase_id_token", idToken);

      setNotifType('success');
      setNotifMessage('Logged in successfully');
      setShowNotif(true);
    } catch (error) {
      let errorMsg = 'Google login failed. Please try again.';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMsg = 'Login cancelled. Please try again if you want to continue.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMsg = 'Popup was blocked. Please allow popups and try again.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMsg = 'An account already exists with this email using a different sign-in method.';
      } else if (error.code === 'permission-denied') {
        errorMsg = 'Unable to save your profile. Please contact support.';
      }
      
      setNotifType('error');
      setNotifMessage(errorMsg);
      setShowNotif(true);
    } finally {
      setPopupInProgress(false);
    }
  };

  // --- Facebook Login ---
  const handleFacebook = async () => {
    if (popupInProgress) return;
    setPopupInProgress(true);
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;

      // Save Facebook user to Firestore (or update if exists)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ")[1] || "",
        email: user.email,
        photoURL: user.photoURL,
        provider: "facebook",
        lastLogin: new Date(),
      }, { merge: true }); // merge: true will update if exists, create if not

      const idToken = await user.getIdToken();
      localStorage.setItem("auth", "true");
      localStorage.setItem("firebase_id_token", idToken);

      setNotifType('success');
      setNotifMessage('Logged in successfully');
      setShowNotif(true);
    } catch (error) {
      let errorMsg = 'Facebook login failed. Please try again.';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMsg = 'Login cancelled. Please try again if you want to continue.';
      } else if (error.code === 'auth/popup-blocked') {
        errorMsg = 'Popup was blocked. Please allow popups and try again.';
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        errorMsg = 'An account already exists with this email using a different sign-in method.';
      } else if (error.code === 'permission-denied') {
        errorMsg = 'Unable to save your profile. Please contact support.';
      }
      
      setNotifType('error');
      setNotifMessage(errorMsg);
      setShowNotif(true);
    } finally {
      setPopupInProgress(false);
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
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtext">Log in to access fare tools, saved routes, and personalized settings.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <input className="auth-input" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
            <input className="auth-input" type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required />

            <div className="auth-actions auth-actions-centered">
              <button className="btn-primary" type="submit">Log In</button>
            </div>

            <div style={{marginTop:12, textAlign:'center'}}>
              <span style={{color:'#666'}}>Don't have an account? </span>
              <Link to="/signup" style={{color:'#0d7a49', fontWeight:600}}>Sign up</Link>
            </div>

            <div className="or-divider">
              <span></span>
              <strong>or</strong>
              <span></span>
            </div>

            <div className="social-label">login with</div>

            <div className="social-row">
              <button type="button" className="social-btn social-google" onClick={handleGoogle}>
                <img src={googleLogo} alt="Google" style={{width:22, height:22}} />
              </button>
              <button type="button" className="social-btn social-fb" onClick={handleFacebook}>
                <img src={fbLogo} alt="Facebook" style={{width:20, height:20}} />
              </button>
            </div>
          </form>
        </div>

        <div className="auth-right">
          <img src={bbLogo} alt="Budget Byahe" className="brand-logo-panel" />
          <h3>Transparent Fare, Fair Rides</h3>
          <p>Budget Byahe helps commuters calculate accurate fares across tricycles and jeepneys. Secure your trips, save routes, and get fare updates.</p>
          <div className="auth-footer-link" onClick={() => navigate('/')}>Learn more on the Homepage</div>
        </div>
      </div>
    </div>
      {showNotif && (
        <NotificationModal
          type={notifType}
          message={notifMessage}
          onClose={() => {
            setShowNotif(false);
            if (notifType === 'success') navigate('/mainFeature');
          }}
        />
      )}
    </>
  );
}

export default Login;