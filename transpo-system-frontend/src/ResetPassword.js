 import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Auth.css';
import bbLogo from './assets/bb-logo.png';
import { auth, verifyPasswordResetCode, confirmPasswordReset } from './firebase';
import NotificationModal from './components/NotificationModal';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('success');
  const [oobCode, setOobCode] = useState('');

  useEffect(() => {
    const code = searchParams.get('oobCode');
    const mode = searchParams.get('mode');
    
    // Check if this is a password reset action
    if (mode && mode !== 'resetPassword') {
      setNotifType('error');
      setNotifMessage('Invalid action type. This page is only for password reset.');
      setShowNotif(true);
      setIsLoading(false);
      return;
    }
    
    if (!code) {
      setNotifType('error');
      setNotifMessage('Invalid or missing reset code. Please request a new password reset link.');
      setShowNotif(true);
      setIsLoading(false);
      return;
    }

    setOobCode(code);

    // Verify the password reset code is valid
    verifyPasswordResetCode(auth, code)
      .then((emailAddress) => {
        setEmail(emailAddress);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error verifying reset code:', error);
        let errorMsg = 'Invalid or expired reset link.';
        
        if (error.code === 'auth/invalid-action-code') {
          errorMsg = 'This password reset link is invalid or has already been used.';
        } else if (error.code === 'auth/expired-action-code') {
          errorMsg = 'This password reset link has expired. Please request a new one.';
        }
        
        setNotifType('error');
        setNotifMessage(errorMsg);
        setShowNotif(true);
        setIsLoading(false);
      });
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (newPassword.length < 6) {
      setNotifType('error');
      setNotifMessage('Password must be at least 6 characters long.');
      setShowNotif(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setNotifType('error');
      setNotifMessage('Passwords do not match.');
      setShowNotif(true);
      return;
    }

    setIsSubmitting(true);

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      
      setNotifType('success');
      setNotifMessage('Password has been reset successfully! Redirecting to login...');
      setShowNotif(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Error resetting password:', error);
      let errorMsg = 'Failed to reset password. Please try again.';
      
      if (error.code === 'auth/weak-password') {
        errorMsg = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/invalid-action-code') {
        errorMsg = 'This reset link is invalid or has already been used.';
      } else if (error.code === 'auth/expired-action-code') {
        errorMsg = 'This reset link has expired. Please request a new one.';
      }
      
      setNotifType('error');
      setNotifMessage(errorMsg);
      setShowNotif(true);
      setIsSubmitting(false);
    }
  };

  const handleNotificationClose = () => {
    setShowNotif(false);
    // If there was an error with the code, redirect to login
    if (notifType === 'error' && !email) {
      navigate('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-left">
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <img src={bbLogo} alt="Budget Byahe Logo" style={{ width: '80px', marginBottom: '20px' }} />
              <h2 style={{ color: '#0d7a49', marginBottom: '10px' }}>Budget Byahe</h2>
              <p style={{ color: '#666' }}>Verifying reset link...</p>
            </div>
          </div>
          <div className="auth-right">
            <img src={bbLogo} alt="Budget Byahe Brand" className="brand-logo-panel" />
            <h3>Secure Password Reset</h3>
            <p>We're verifying your password reset link to ensure your account security.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!email) {
    return null; // Will show error notification and redirect
  }

  return (
    <>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-left">
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <img src={bbLogo} alt="Budget Byahe Logo" style={{ width: '70px', marginBottom: '15px' }} />
              <h2 style={{ color: '#0d7a49', fontSize: '1.5rem', margin: '0 0 5px 0' }}>Budget Byahe</h2>
            </div>

            <h1 className="auth-title">Reset Your Password</h1>
            <p className="auth-subtext">Enter your new password for <strong style={{ color: '#0d7a49' }}>{email}</strong></p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div>
                <label htmlFor="newPassword" style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '600', fontSize: '0.9rem' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    className="auth-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min. 6 characters)"
                    required
                    disabled={isSubmitting}
                    style={{ paddingRight: '45px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
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
                    aria-label={showNewPassword ? "Hide password" : "Show password"}
                  >
                    {showNewPassword ? (
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

              <div>
                <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '600', fontSize: '0.9rem' }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    className="auth-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                    disabled={isSubmitting}
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
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
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

              <div className="auth-actions-centered" style={{ marginTop: '20px' }}>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={isSubmitting}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px',
                    opacity: isSubmitting ? '0.7' : '1',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmitting && <span className="auth-spinner"></span>}
                  {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </div>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                Remember your password?{' '}
                <span 
                  style={{ color: '#0d7a49', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => navigate('/login')}
                >
                  Back to Login
                </span>
              </p>
            </div>
          </div>

          <div className="auth-right">
            <img src={bbLogo} alt="Budget Byahe Brand" className="brand-logo-panel" />
            <h3>Create a Secure Password</h3>
            <p>Your password should be at least 6 characters long. We recommend using a mix of letters, numbers, and special characters for better security.</p>
            <p style={{ marginTop: '20px', fontSize: '0.9rem', opacity: '0.85' }}>
              💡 <strong>Tip:</strong> Use a password manager to generate and store strong passwords securely.
            </p>
          </div>
        </div>
      </div>

      {showNotif && (
        <NotificationModal
          type={notifType}
          message={notifMessage}
          onClose={handleNotificationClose}
        />
      )}
    </>
  );
}

export default ResetPassword;
