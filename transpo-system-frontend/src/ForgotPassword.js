import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';
import bbLogo from './assets/bb-logo.png';
import { auth, sendPasswordResetEmail } from './firebase';
import NotificationModal from './components/NotificationModal';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('success');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setNotifType('error');
      setNotifMessage('Please enter your email address.');
      setShowNotif(true);
      return;
    }

    setIsSubmitting(true);

    try {
      await sendPasswordResetEmail(auth, email);
      
      setEmailSent(true);
      setNotifType('success');
      setNotifMessage('Password reset email sent! Please check your inbox.');
      setShowNotif(true);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      let errorMsg = 'Failed to send password reset email. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMsg = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMsg = 'Too many requests. Please wait a few minutes before trying again.';
      }
      
      setNotifType('error');
      setNotifMessage(errorMsg);
      setShowNotif(true);
      setIsSubmitting(false);
    }
  };

  const handleNotificationClose = () => {
    setShowNotif(false);
  };

  if (emailSent) {
    return (
      <>
        <div className="auth-page">
          <div className="auth-card">
            <div className="auth-left">
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <img src={bbLogo} alt="Budget Byahe Logo" style={{ width: '70px', marginBottom: '15px' }} />
                <h2 style={{ color: '#0d7a49', fontSize: '1.5rem', margin: '0 0 5px 0' }}>Budget Byahe</h2>
              </div>

              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #0a5c36 0%, #0d7a49 100%)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  margin: '0 auto 20px'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" style={{ width: '40px', height: '40px' }}>
                    <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                    <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                  </svg>
                </div>
                
                <h1 className="auth-title" style={{ marginBottom: '15px' }}>Check Your Email</h1>
                <p className="auth-subtext" style={{ marginBottom: '20px' }}>
                  We've sent a password reset link to <strong style={{ color: '#0d7a49' }}>{email}</strong>
                </p>

                <div style={{ 
                  background: '#f8fff9', 
                  border: '1px solid #e8f5e9', 
                  borderRadius: '10px', 
                  padding: '20px',
                  marginBottom: '20px',
                  textAlign: 'left'
                }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem', color: '#0a5c36' }}>Next Steps:</h3>
                  <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: '#555' }}>
                    <li style={{ marginBottom: '8px' }}>Check your email inbox for our message</li>
                    <li style={{ marginBottom: '8px' }}>Click the reset password link in the email</li>
                    <li style={{ marginBottom: '8px' }}>Enter your new password</li>
                    <li>Log in with your new password</li>
                  </ol>
                </div>

                <div style={{ 
                  fontSize: '0.85rem', 
                  color: '#666',
                  marginBottom: '20px',
                  textAlign: 'left'
                }}>
                  <p style={{ margin: '0 0 8px 0' }}>
                    💡 <strong>Didn't receive the email?</strong>
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '20px' }}>
                    <li>Check your spam or junk folder</li>
                    <li>Make sure {email} is correct</li>
                    <li>Wait a few minutes for the email to arrive</li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                    setIsSubmitting(false);
                  }}
                  className="btn-primary"
                  style={{ width: '100%', marginBottom: '12px' }}
                >
                  Send Another Email
                </button>

                <div style={{ textAlign: 'center' }}>
                  <button
                    onClick={() => navigate('/login')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0d7a49',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            </div>

            <div className="auth-right">
              <img src={bbLogo} alt="Budget Byahe Brand" className="brand-logo-panel" />
              <h3>Secure Password Reset</h3>
              <p>We take your account security seriously. The password reset link will expire in 1 hour for your protection.</p>
              <p style={{ marginTop: '20px', fontSize: '0.9rem', opacity: '0.85' }}>
                💡 <strong>Tip:</strong> Use a strong password with at least 6 characters, including letters and numbers.
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

  return (
    <>
      <div className="auth-page">
        <div className="auth-card">
          <button
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
            onClick={() => navigate('/login')}
          >
            <svg xmlns="http://www.w3.org/2000/svg"
                 fill="none"
                 viewBox="0 0 24 24"
                 strokeWidth={2}
                 stroke="currentColor"
                 style={{ width: '16px', height: '16px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Login
          </button>

          <div className="auth-left">
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <img src={bbLogo} alt="Budget Byahe Logo" style={{ width: '70px', marginBottom: '15px' }} />
              <h2 style={{ color: '#0d7a49', fontSize: '1.5rem', margin: '0 0 5px 0' }}>Budget Byahe</h2>
            </div>

            <h1 className="auth-title">Forgot Password?</h1>
            <p className="auth-subtext">
              No worries! Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="auth-form">
              <div>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', color: '#333', fontWeight: '600', fontSize: '0.9rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={isSubmitting}
                />
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
                  {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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
            <h3>Reset Your Password</h3>
            <p>We'll send you an email with a secure link to reset your password. The link will be valid for 1 hour.</p>
            <p style={{ marginTop: '20px', fontSize: '0.9rem', opacity: '0.85' }}>
              🔒 <strong>Security First:</strong> We never store your password in plain text and use industry-standard encryption to protect your account.
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

export default ForgotPassword;
