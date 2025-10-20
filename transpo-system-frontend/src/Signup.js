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

function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  
  let lastPage = localStorage.getItem("lastPage") || "/";
  let backLabel = "Previous Page";

  if (lastPage === "/home") backLabel = "Home";
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

      // Store login token locally
      const idToken = await user.getIdToken();
      localStorage.setItem("auth", "true");
      localStorage.setItem("firebase_id_token", idToken);

      navigate("/mainFeature");
    } catch (error) {
      console.error(error);
      alert("Signup failed: " + error.message);
    }
  };

  // --- GOOGLE SIGNUP ---
  const handleGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Save Google user to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ")[1] || "",
        email: user.email,
        photoURL: user.photoURL,
        provider: "google",
        createdAt: new Date(),
      });

      const idToken = await user.getIdToken();
      localStorage.setItem("auth", "true");
      localStorage.setItem("firebase_id_token", idToken);

      navigate("/mainFeature");
    } catch (error) {
      console.error(error);
      alert("Google signup failed: " + error.message);
    }
  };

  // --- FACEBOOK SIGNUP ---
  const handleFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;

      // Save Facebook user to Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ")[1] || "",
        email: user.email,
        photoURL: user.photoURL,
        provider: "facebook",
        createdAt: new Date(),
      });

      const idToken = await user.getIdToken();
      localStorage.setItem("auth", "true");
      localStorage.setItem("firebase_id_token", idToken);

      navigate("/mainFeature");
    } catch (error) {
      console.error(error);
      alert("Facebook signup failed: " + error.message);
    }
  };

  return (
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
                aria-label="Sign up with Google"
              >
                <img src={googleLogo} alt="Google" style={{ width: 22, height: 22 }} />
              </button>
              <button
                type="button"
                className="social-btn social-fb"
                onClick={handleFacebook}
                aria-label="Sign up with Facebook"
              >
                <img src={fbLogo} alt="Facebook" style={{ width: 20, height: 20 }} />
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
  );
}

export default Signup;
