import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';
import googleLogo from './assets/google_logo.png';
import fbLogo from './assets/fb_logo_white.png';
import bbLogo from './assets/bb-logo.png';

import {
  auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  facebookProvider,
} from "./firebase";

function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Email & Password Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCred.user.getIdToken();

      // Save token locally (or send to backend)
      localStorage.setItem('auth', 'true');
      localStorage.setItem('firebase_id_token', idToken);

      navigate('/mainFeature');
    } catch (error) {
      console.error(error);
      alert('Login failed: ' + error.message);
    }
  };

  // Google Login
  const handleGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      localStorage.setItem("auth", "true");
      localStorage.setItem("firebase_id_token", idToken);

      navigate("/mainFeature");
    } catch (error) {
      console.error(error);
      alert("Google login failed: " + error.message);
    }
  };

  // Facebook Login
  const handleFacebook = async () => {
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const idToken = await result.user.getIdToken();

      localStorage.setItem("auth", "true");
      localStorage.setItem("firebase_id_token", idToken);

      navigate("/mainFeature");
    } catch (error) {
      console.error(error);
      alert("Facebook login failed: " + error.message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-left">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtext">Log in to access fare tools, saved routes and personalized settings.</p>

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
              <button type="button" className="social-btn social-google" onClick={handleGoogle} aria-label="Sign in with Google">
                <img src={googleLogo} alt="Google" style={{width:22, height:22}} />
              </button>
              <button type="button" className="social-btn social-fb" onClick={handleFacebook} aria-label="Sign in with Facebook">
                <img src={fbLogo} alt="Facebook" style={{width:20, height:20}} />
              </button>
            </div>
          </form>
        </div>

        <div className="auth-right">
          <img src={bbLogo} alt="Budget Byahe" className="brand-logo-panel" />
          <h3>Transparent Fare, Fair Rides</h3>
          <p>Budget Biyahe helps commuters calculate accurate fares across tricycles and jeepneys. Secure your trips, save routes, and get fare updates.</p>
          <div className="auth-footer-link" onClick={() => window.location.href = '/'}>Learn more on the Homepage</div>
        </div>
      </div>
    </div>
  )
}

export default Login;
