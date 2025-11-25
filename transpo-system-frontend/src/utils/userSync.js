// Utility function to sync Firebase user to MySQL database
export const syncUserToMySQL = async (user, firstName, lastName, profilePicture) => {
  try {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
    const fullName = `${firstName || ''} ${lastName || ''}`.trim() || user.displayName || '';
    
    const payload = {
      firebase_uid: user.uid,
      email: user.email,
      name: fullName,
    };

    console.log('Syncing user to MySQL:', payload);
    
    const syncResponse = await fetch(`${apiUrl}/users/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const syncData = await syncResponse.json();
    console.log('MySQL sync response:', syncData);
    
    if (syncData.success) {
      // Store MySQL user ID in localStorage
      localStorage.setItem('userId', syncData.data.id);
      console.log('User synced to MySQL successfully:', syncData.data);
      return syncData.data;
    } else {
      console.error('MySQL sync failed:', syncData.message, syncData);
      return null;
    }
  } catch (syncError) {
    console.error('Failed to sync user to MySQL:', syncError);
    return null;
  }
};
