import React, { useState, useRef } from "react";
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
  sendEmailVerification,
} from "./firebase";

import NotificationModal from './components/NotificationModal';
import { compressImage, getBase64Size } from './utils/imageCompression';

function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Notification modal state
  const [showNotif, setShowNotif] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('success');
  // popup guard
  const [popupInProgress, setPopupInProgress] = useState(false);
  // Loading states for social login buttons
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  
  let lastPage = localStorage.getItem("lastPage") || "/";
  let backLabel = "Previous Page";

  if (lastPage === "/") backLabel = "Home";
  else if (lastPage.includes("home")) backLabel = "Home";
  else if (lastPage.includes("routes")) backLabel = "Routes";
  else if (lastPage.includes("fare")) backLabel = "Fares";
  else if (lastPage.includes("map")) backLabel = "Map";

  // --- EMAIL & PASSWORD SIGNUP ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setNotifType('error');
      setNotifMessage('Passwords do not match!');
      setShowNotif(true);
      return;
    }
    
    setLoading(true);
    
    try {
      // Create account in Firebase Auth
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      // Store pending user data in localStorage (will be saved to Firestore after verification)
      localStorage.setItem('pendingUserData', JSON.stringify({
        uid: user.uid,
        firstName,
        lastName,
        email,
        profilePicture: profilePicture || '',
        provider: "password",
      }));
      
      localStorage.setItem('userFirstName', firstName);
      localStorage.setItem('userLastName', lastName);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userId', user.uid);
      localStorage.setItem('userProfilePicture', profilePicture || '');

      // Store login token locally
      const idToken = await user.getIdToken();
      localStorage.setItem("auth", "true");
      localStorage.setItem("firebase_id_token", idToken);

      // Send email verification
      await sendEmailVerification(user);

      setNotifType('success');
      setNotifMessage('Account created! Please check your email to verify your account.');
      setShowNotif(true);
    } catch (error) {
      
      let errorMsg = error.message;
      if (error.code === 'auth/email-already-in-use') {
        // Check if this email has a pending verification
        errorMsg = 'This email is already registered. If you haven\'t verified your email yet, please check your inbox or request a new verification link from the login page.';
      } else if (error.code === 'auth/weak-password') {
        errorMsg = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address.';
      }
      
      setNotifType('error');
      setNotifMessage(errorMsg);
      setShowNotif(true);
      setLoading(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setNotifType('error');
        setNotifMessage('Please select a valid image file!');
        setShowNotif(true);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      try {
        // Compress image
        const compressedImage = await compressImage(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 800,
          quality: 0.85
        });

        const finalSize = getBase64Size(compressedImage);
        console.log(`Compressed image size: ${finalSize.toFixed(2)} MB`);

        setProfilePicture(compressedImage);
        
        setNotifType('success');
        setNotifMessage(`Profile picture uploaded (${finalSize.toFixed(2)} MB)`);
        setShowNotif(true);
      } catch (error) {
        console.error('Error compressing image:', error);
        setNotifType('error');
        setNotifMessage('Failed to process image. Please try another image.');
        setShowNotif(true);
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfilePicture('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getInitials = () => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
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
      localStorage.setItem('userProfilePicture', '');

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
      localStorage.setItem('userProfilePicture', '');

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
            
            <div className="password-row">
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  className="auth-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
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

              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  className="auth-input"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ paddingRight: '45px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? (
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
            </div>

            <div className="auth-actions auth-actions-centered">
              <button className="btn-primary" type="submit" disabled={loading || googleLoading || facebookLoading}>
                {loading ? <div className="auth-spinner"></div> : 'Sign Up'}
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
            if (notifType === 'success') navigate('/verify-email');
          }}
        />
      )}
    </>
  );
}

export default Signup;
