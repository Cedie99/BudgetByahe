import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Auth.css';
import bbLogo from './assets/bb-logo.png';
import { auth, onAuthStateChanged, db, doc, setDoc } from './firebase';
import { applyActionCode, sendEmailVerification } from 'firebase/auth';
import NotificationModal from './components/NotificationModal';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('success');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        setEmail(user.email || '');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');

    // If this is a verification link from email
    if (mode === 'verifyEmail' && oobCode) {
      verifyEmailWithCode(oobCode);
    } else {
      // User came directly to this page (not from email link)
      setIsVerifying(false);
      
      // Check if user is logged in and already verified
      if (currentUser) {
        if (currentUser.emailVerified) {
          navigate('/routes');
        }
      }
    }
  }, [searchParams, currentUser, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const verifyEmailWithCode = async (code) => {
    try {
      // Check if user is already verified
      if (auth.currentUser && auth.currentUser.emailVerified) {
        setVerificationSuccess(true);
        setIsVerifying(false);
        setTimeout(() => {
          navigate('/routes');
        }, 1000);
        return;
      }

      await applyActionCode(auth, code);
      
      // Reload user to get updated emailVerified status
      if (auth.currentUser) {
        await auth.currentUser.reload();
        setCurrentUser(auth.currentUser);
        
        // Now save user data to Firestore after successful verification
        const pendingUserData = localStorage.getItem('pendingUserData');
        if (pendingUserData) {
          try {
            const userData = JSON.parse(pendingUserData);
            await setDoc(doc(db, "users", auth.currentUser.uid), {
              ...userData,
              createdAt: new Date(),
              emailVerified: true,
            });
            localStorage.removeItem('pendingUserData');
          } catch (firestoreError) {
            console.error('Error saving to Firestore:', firestoreError);
          }
        }
      }
      
      setVerificationSuccess(true);
      setIsVerifying(false);
      
      setNotifType('success');
      setNotifMessage('Email verified successfully! Redirecting...');
      setShowNotif(true);

      // Redirect to routes page after 2 seconds
      setTimeout(() => {
        navigate('/routes');
      }, 2000);
    } catch (error) {
      console.error('Error verifying email:', error);
      setIsVerifying(false);
      
      let errorMsg = 'Failed to verify email. Please try again.';
      
      if (error.code === 'auth/invalid-action-code') {
        // Check if user is already verified
        if (auth.currentUser) {
          await auth.currentUser.reload();
          if (auth.currentUser.emailVerified) {
            errorMsg = 'Your email is already verified! Redirecting...';
            setNotifType('success');
            setNotifMessage(errorMsg);
            setShowNotif(true);
            setTimeout(() => {
              navigate('/routes');
            }, 2000);
            return;
          }
        }
        errorMsg = 'This verification link is invalid or has already been used.';
      } else if (error.code === 'auth/expired-action-code') {
        errorMsg = 'This verification link has expired. Please request a new one.';
      }
      
      setNotifType('error');
      setNotifMessage(errorMsg);
      setShowNotif(true);
    }
  };

  const handleResendVerification = async () => {
    if (!canResend || !currentUser) return;

    try {
      await sendEmailVerification(currentUser);
      
      setNotifType('success');
      setNotifMessage('Verification email sent! Please check your inbox.');
      setShowNotif(true);
      
      setCanResend(false);
      setCountdown(60); // 60 second cooldown
    } catch (error) {
      console.error('Error sending verification email:', error);
      
      let errorMsg = 'Failed to send verification email. Please try again.';
      
      if (error.code === 'auth/too-many-requests') {
        errorMsg = 'Too many requests. Please wait a few minutes before trying again.';
      }
      
      setNotifType('error');
      setNotifMessage(errorMsg);
      setShowNotif(true);
    }
  };

  const handleLogout = () => {
    auth.signOut();
    localStorage.clear();
    navigate('/login');
  };

  const handleNotificationClose = () => {
    setShowNotif(false);
  };

  if (isVerifying) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-left">
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <img src={bbLogo} alt="Budget Byahe Logo" style={{ width: '80px', marginBottom: '20px' }} />
              <h2 style={{ color: '#0d7a49', marginBottom: '10px' }}>Budget Byahe</h2>
              <div className="auth-spinner" style={{ margin: '20px auto' }}></div>
              <p style={{ color: '#666' }}>Verifying your email...</p>
            </div>
          </div>
          <div className="auth-right">
            <img src={bbLogo} alt="Budget Byahe Brand" className="brand-logo-panel" />
            <h3>Email Verification</h3>
            <p>We're verifying your email address to secure your account and give you full access to Budget Byahe.</p>
          </div>
        </div>
      </div>
    );
  }

  if (verificationSuccess) {
    return (
      <>
        <div className="auth-page">
          <div className="auth-card">
            <div className="auth-left">
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
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
                    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 style={{ color: '#0d7a49', marginBottom: '10px' }}>Email Verified!</h2>
                <p style={{ color: '#666' }}>Your email has been successfully verified.</p>
                <p style={{ color: '#666', marginTop: '20px' }}>Redirecting you to the routes page...</p>
              </div>
            </div>
            <div className="auth-right">
              <img src={bbLogo} alt="Budget Byahe Brand" className="brand-logo-panel" />
              <h3>Welcome to Budget Byahe!</h3>
              <p>Your account is now fully activated. You can now save routes, receive fare alerts, and get personalized commute suggestions.</p>
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
          <div className="auth-left">
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <img src={bbLogo} alt="Budget Byahe Logo" style={{ width: '70px', marginBottom: '15px' }} />
              <h2 style={{ color: '#0d7a49', fontSize: '1.5rem', margin: '0 0 5px 0' }}>Budget Byahe</h2>
            </div>

            <h1 className="auth-title">Verify Your Email</h1>
            <p className="auth-subtext">
              We've sent a verification email to <strong style={{ color: '#0d7a49' }}>{email}</strong>
            </p>

            <div style={{ 
              background: '#f8fff9', 
              border: '1px solid #e8f5e9', 
              borderRadius: '10px', 
              padding: '20px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0d7a49" style={{ width: '24px', height: '24px', flexShrink: 0, marginTop: '2px' }}>
                  <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                  <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                </svg>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#0a5c36' }}>Check your inbox</h3>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
                    Click the verification link in the email we sent you to activate your account and access all features.
                  </p>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '12px' }}>
                Didn't receive the email?
              </p>
              <button
                onClick={handleResendVerification}
                disabled={!canResend}
                className="btn-primary"
                style={{
                  width: '100%',
                  opacity: !canResend ? 0.6 : 1,
                  cursor: !canResend ? 'not-allowed' : 'pointer'
                }}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Verification Email'}
              </button>
            </div>

            <div style={{ 
              borderTop: '1px solid #e5e7eb', 
              paddingTop: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
                💡 <strong>Tips:</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#666' }}>
                <li>Check your spam or junk folder</li>
                <li>Make sure {email} is correct</li>
                <li>Wait a few minutes for the email to arrive</li>
              </ul>
            </div>

            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button
                onClick={handleLogout}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#dc2626',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Sign out
              </button>
            </div>
          </div>

          <div className="auth-right">
            <img src={bbLogo} alt="Budget Byahe Brand" className="brand-logo-panel" />
            <h3>Why Verify Your Email?</h3>
            <p>Email verification helps us:</p>
            <ul style={{ paddingLeft: '20px', marginTop: '12px' }}>
              <li style={{ marginBottom: '8px' }}>Protect your account from unauthorized access</li>
              <li style={{ marginBottom: '8px' }}>Send you important route and fare updates</li>
              <li style={{ marginBottom: '8px' }}>Help you recover your account if needed</li>
              <li>Ensure you receive commute suggestions and alerts</li>
            </ul>
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

export default VerifyEmail;
