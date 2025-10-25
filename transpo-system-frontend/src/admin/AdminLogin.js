import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminAuth.css';
import bbLogo from '../assets/bb-logo.png';
import { auth, signInWithEmailAndPassword, db, doc, getDoc } from '../firebase';
import NotificationModal from '../components/NotificationModal';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('success');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Sign in with Firebase
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      // Check if user is admin in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists() || userDoc.data().role !== 'admin') {
        // Not an admin, sign out immediately
        await auth.signOut();
        setNotifType('error');
        setNotifMessage('Access denied. Admin privileges required.');
        setShowNotif(true);
        setIsLoading(false);
        return;
      }

      // Get token and store admin session
      const idToken = await user.getIdToken();
      localStorage.setItem('adminAuth', 'true');
      localStorage.setItem('adminToken', idToken);
      localStorage.setItem('adminId', user.uid);
      localStorage.setItem('adminEmail', user.email);
      
      const userData = userDoc.data();
      localStorage.setItem('adminName', `${userData.firstName || ''} ${userData.lastName || ''}`.trim());

      setNotifType('success');
      setNotifMessage('Welcome to Admin Dashboard!');
      setShowNotif(true);
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1000);
    } catch (error) {
      console.error('Admin login error:', error);
      let errorMsg = 'Login failed. Please try again.';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMsg = 'Invalid email or password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMsg = 'Too many failed attempts. Please try again later.';
      } else if (error.code === 'auth/invalid-credential') {
        errorMsg = 'Invalid credentials. Please check your email and password.';
      }
      
      setNotifType('error');
      setNotifMessage(errorMsg);
      setShowNotif(true);
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="admin-auth-page">
        <div className="admin-auth-card">
          <div className="admin-auth-header">
            <img src={bbLogo} alt="Budget Byahe Logo" className="admin-logo" />
            <h1 className="admin-auth-title">Budget Byahe</h1>
            <p className="admin-auth-subtitle">Administrator Dashboard</p>
          </div>

          <form className="admin-auth-form" onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="admin-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@budgetbyahe.com"
                required
                disabled={isLoading}
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="password">Password</label>
              <div className="admin-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="admin-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="admin-submit-btn"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? (
                <>
                  <span className="admin-spinner"></span>
                  Signing in...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
          </form>

          <div className="admin-auth-footer">
            <p>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
              </svg>
              Secure Access · Authorized Personnel Only
            </p>
          </div>
        </div>
      </div>

      {showNotif && (
        <NotificationModal
          type={notifType}
          message={notifMessage}
          onClose={() => setShowNotif(false)}
        />
      )}
    </>
  );
}

export default AdminLogin;
