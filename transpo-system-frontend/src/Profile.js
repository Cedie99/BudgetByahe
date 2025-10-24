import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { auth, signOut, db, doc, setDoc, sendPasswordResetEmail } from './firebase';
import NotificationModal from './components/NotificationModal';
import { compressImage, getBase64Size } from './utils/imageCompression';

function Profile() {
  const navigate = useNavigate();
  const [userFirstName, setUserFirstName] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedFirstName, setEditedFirstName] = useState('');
  const [editedLastName, setEditedLastName] = useState('');
  const [editedProfilePicture, setEditedProfilePicture] = useState('');
  const [showNotif, setShowNotif] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('success');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    // Check if user is logged in
    const authStatus = localStorage.getItem('auth');
    if (authStatus !== 'true') {
      navigate('/login');
      return;
    }

    // Load user data from localStorage
    const firstName = localStorage.getItem('userFirstName') || '';
    const lastName = localStorage.getItem('userLastName') || '';
    const email = localStorage.getItem('userEmail') || '';
    const id = localStorage.getItem('userId') || '';
    const picture = localStorage.getItem('userProfilePicture') || '';

    setUserFirstName(firstName);
    setUserLastName(lastName);
    setUserEmail(email);
    setUserId(id);
    setProfilePicture(picture);
    setEditedFirstName(firstName);
    setEditedLastName(lastName);
    setEditedProfilePicture(picture);
  }, [navigate]);

  const handleResetPassword = async () => {
    if (!userEmail) {
      setNotifType('error');
      setNotifMessage('Email address not found. Please log in again.');
      setShowNotif(true);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, userEmail);
      setNotifType('success');
      setNotifMessage('Password reset link has been sent to your email!');
      setShowNotif(true);
    } catch (error) {
      console.error('Password reset error:', error);
      let errorMsg = 'Failed to send password reset email. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMsg = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMsg = 'Too many requests. Please try again later.';
      }
      
      setNotifType('error');
      setNotifMessage(errorMsg);
      setShowNotif(true);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - restore original values
      setEditedFirstName(userFirstName);
      setEditedLastName(userLastName);
      setEditedProfilePicture(profilePicture);
    }
    setIsEditing(!isEditing);
  };

  const handleProfilePictureClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
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
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      try {
        // Show loading state
        setNotifType('info');
        setNotifMessage('Compressing image...');
        setShowNotif(true);

        // Compress image to max 1MB and 800x800 dimensions
        const compressedImage = await compressImage(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 800,
          quality: 0.85
        });

        // Verify the compressed size
        const finalSize = getBase64Size(compressedImage);
        console.log(`Compressed image size: ${finalSize.toFixed(2)} MB`);

        setEditedProfilePicture(compressedImage);
        
        // Show success notification
        setNotifType('success');
        setNotifMessage(`Image uploaded and compressed to ${finalSize.toFixed(2)} MB!`);
        setShowNotif(true);
      } catch (error) {
        console.error('Error compressing image:', error);
        setNotifType('error');
        setNotifMessage('Failed to process image. Please try another image.');
        setShowNotif(true);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleRemoveProfilePicture = () => {
    setEditedProfilePicture('');
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveChanges = async () => {
    // Validation
    if (!editedFirstName.trim() || !editedLastName.trim()) {
      setNotifType('error');
      setNotifMessage('First name and last name cannot be empty!');
      setShowNotif(true);
      return;
    }

    setIsSaving(true);

    try {
      // Update Firestore
      const userDocRef = doc(db, 'users', userId);
      await setDoc(userDocRef, {
        firstName: editedFirstName.trim(),
        lastName: editedLastName.trim(),
        email: userEmail,
        profilePicture: editedProfilePicture || ''
      }, { merge: true });

      // Update localStorage
      localStorage.setItem('userFirstName', editedFirstName.trim());
      localStorage.setItem('userLastName', editedLastName.trim());
      localStorage.setItem('userProfilePicture', editedProfilePicture || '');

      // Update state
      setUserFirstName(editedFirstName.trim());
      setUserLastName(editedLastName.trim());
      setProfilePicture(editedProfilePicture);

      // Trigger navbar update
      window.dispatchEvent(new Event('storage'));

      // Show success notification
      setNotifType('success');
      setNotifMessage('Profile updated successfully!');
      setShowNotif(true);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setNotifType('error');
      setNotifMessage('Failed to update profile. Please try again.');
      setShowNotif(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('auth');
      localStorage.removeItem('firebase_id_token');
      localStorage.removeItem('userFirstName');
      localStorage.removeItem('userLastName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId');
      localStorage.removeItem('userProfilePicture');
      
      navigate('/home');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Get initials for avatar
  const getInitials = () => {
    const firstInitial = userFirstName ? userFirstName.charAt(0).toUpperCase() : '';
    const lastInitial = userLastName ? userLastName.charAt(0).toUpperCase() : '';
    return firstInitial + lastInitial;
  };

  // Get display picture (either uploaded or initials)
  const displayPicture = isEditing ? editedProfilePicture : profilePicture;

  return (
    <>
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-header">
            <button 
              className="back-btn"
              onClick={() => navigate(-1)}
              title="Go back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            
            <h1 className="profile-title">My Profile</h1>
          </div>

          <div className="profile-card">
            <button 
              className={`edit-btn ${isEditing ? 'cancel' : ''}`}
              onClick={handleEditToggle}
              disabled={isSaving}
              title={isEditing ? 'Cancel editing' : 'Edit profile'}
            >
              {isEditing ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                  </svg>
                  Edit
                </>
              )}
            </button>

            <div className="profile-avatar-section">
              <div className="avatar-wrapper">
                <div 
                  className={`profile-avatar ${isEditing ? 'editable' : ''}`}
                  onClick={handleProfilePictureClick}
                  title={isEditing ? 'Click to change profile picture' : ''}
                >
                  {displayPicture ? (
                    <img src={displayPicture} alt="Profile" className="profile-avatar-img" />
                  ) : (
                    <span className="profile-initials">{getInitials()}</span>
                  )}
                </div>
                {isEditing && (
                  <div 
                    className="avatar-edit-badge"
                    onClick={handleProfilePictureClick}
                    title="Click to change photo"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
                      <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3h-15a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0zm12-1.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              
              {isEditing && editedProfilePicture && (
                <button 
                  className="btn-remove-picture"
                  onClick={handleRemoveProfilePicture}
                  title="Remove profile picture"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Remove Picture
                </button>
              )}
            </div>

            <div className="profile-info">
              <div className="profile-field">
                <label>First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="profile-input"
                    value={editedFirstName}
                    onChange={(e) => setEditedFirstName(e.target.value)}
                    placeholder="Enter first name"
                  />
                ) : (
                  <div className="profile-value">{userFirstName || 'N/A'}</div>
                )}
              </div>

              <div className="profile-field">
                <label>Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    className="profile-input"
                    value={editedLastName}
                    onChange={(e) => setEditedLastName(e.target.value)}
                    placeholder="Enter last name"
                  />
                ) : (
                  <div className="profile-value">{userLastName || 'N/A'}</div>
                )}
              </div>

              <div className="profile-field">
                <label>Email Address</label>
                <div className="profile-value email-readonly">
                  {userEmail || 'N/A'}
                  {isEditing && <span className="readonly-badge">Read-only</span>}
                </div>
              </div>
            </div>

            <div className="profile-actions">
              {isEditing ? (
                <button 
                  className="btn-save-changes" 
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="save-spinner"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button className="btn-reset-password" onClick={handleResetPassword}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    Reset Password
                  </button>

                  <button className="btn-logout-profile" onClick={handleLogout}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                    </svg>
                    Logout
                  </button>
                </>
              )}
            </div>
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

export default Profile;
