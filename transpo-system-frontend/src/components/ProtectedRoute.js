import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth, onAuthStateChanged } from '../firebase';

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div className="auth-spinner" style={{ width: '40px', height: '40px', border: '4px solid rgba(13, 122, 73, 0.3)', borderTopColor: '#0d7a49' }}></div>
        <p style={{ color: '#666' }}>Loading...</p>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user's email is not verified and they signed up with password provider
  if (!user.emailVerified && user.providerData[0]?.providerId === 'password') {
    return <Navigate to="/verify-email" replace />;
  }

  // User is authenticated and verified, render the protected content
  return children;
}

export default ProtectedRoute;
