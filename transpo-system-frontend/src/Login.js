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
  sendPasswordResetEmail,
  doc,
  setDoc,
  getDoc,
} from "./firebase";

import NotificationModal from './components/NotificationModal';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  // --- Email & Password Login ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;
      const idToken = await user.getIdToken();

      // Get user data from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        localStorage.setItem('userFirstName', userData.firstName || '');
        localStorage.setItem('userLastName', userData.lastName || '');
        localStorage.setItem('userEmail', userData.email || user.email);
        localStorage.setItem('userId', user.uid);
        localStorage.setItem('userProfilePicture', userData.profilePicture || '');
      }

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

      // Save Google user to Firestore (or update if exists)
      const firstName = user.displayName?.split(" ")[0] || "";
      const lastName = user.displayName?.split(" ")[1] || "";
      
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        email: user.email,
        photoURL: user.photoURL,
        provider: "google",
        lastLogin: new Date(),
      }, { merge: true }); // merge: true will update if exists, create if not

      // Get updated user data from Firestore to load custom profile picture if exists
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : {};

      // Save to localStorage
      localStorage.setItem('userFirstName', firstName);
      localStorage.setItem('userLastName', lastName);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userId', user.uid);
      localStorage.setItem('userProfilePicture', userData.profilePicture || '');

      const idToken = await user.getIdToken();
      localStorage.setItem("auth", "true");
      localStorage.setItem("firebase_id_token", idToken);

      // Send password reset email so user can set a password for future email login
      try {
        await sendPasswordResetEmail(auth, user.email);
        setNotifType('success');
        setNotifMessage('Logged in successfully! A password reset email has been sent to set up email login.');
      } catch (resetError) {
        console.error('Failed to send password reset email:', resetError);
        // Still show success for login even if reset email fails
        setNotifType('success');
        setNotifMessage('Logged in successfully');
      }
      
      setShowNotif(true);
    } catch (error) {
      clearTimeout(timeoutId);
      let errorMsg = 'Google login failed. Please try again.';
      
      // Check for popup cancellation
      if (error.code === 'auth/popup-closed-by-user') {
        errorMsg = 'You closed the login popup. Click the button again to try logging in.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMsg = 'The login process was cancelled.';
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

  // --- Facebook Login ---
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

      // Save Facebook user to Firestore (or update if exists)
      const firstName = user.displayName?.split(" ")[0] || "";
      const lastName = user.displayName?.split(" ")[1] || "";
      
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        email: user.email,
        photoURL: user.photoURL,
        provider: "facebook",
        lastLogin: new Date(),
      }, { merge: true }); // merge: true will update if exists, create if not

      // Get updated user data from Firestore to load custom profile picture if exists
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : {};

      // Save to localStorage
      localStorage.setItem('userFirstName', firstName);
      localStorage.setItem('userLastName', lastName);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userId', user.uid);
      localStorage.setItem('userProfilePicture', userData.profilePicture || '');

      const idToken = await user.getIdToken();
      localStorage.setItem("auth", "true");
      localStorage.setItem("firebase_id_token", idToken);

      // Send password reset email so user can set a password for future email login
      try {
        await sendPasswordResetEmail(auth, user.email);
        setNotifType('success');
        setNotifMessage('Logged in successfully! A password reset email has been sent to set up email login.');
      } catch (resetError) {
        console.error('Failed to send password reset email:', resetError);
        // Still show success for login even if reset email fails
        setNotifType('success');
        setNotifMessage('Logged in successfully');
      }
      
      setShowNotif(true);
    } catch (error) {
      clearTimeout(timeoutId);
      let errorMsg = 'Facebook login failed. Please try again.';
      
      // Check for popup cancellation
      if (error.code === 'auth/popup-closed-by-user') {
        errorMsg = 'You closed the login popup. Click the button again to try logging in.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMsg = 'The login process was cancelled.';
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
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtext">Log in to access fare tools, saved routes, and personalized settings.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <input className="auth-input" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
            
            <div style={{ position: 'relative' }}>
              <input 
                className="auth-input" 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                required 
                style={{ paddingRight: '45px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  color: '#666',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>

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
              <button type="button" className="social-btn social-google" onClick={handleGoogle} disabled={googleLoading || facebookLoading}>
                {googleLoading ? (
                  <div className="auth-spinner"></div>
                ) : (
                  <img src={googleLogo} alt="Google" style={{width:22, height:22}} />
                )}
              </button>
              <button type="button" className="social-btn social-fb" onClick={handleFacebook} disabled={googleLoading || facebookLoading}>
                {facebookLoading ? (
                  <div className="auth-spinner"></div>
                ) : (
                  <img src={fbLogo} alt="Facebook" style={{width:20, height:20}} />
                )}
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