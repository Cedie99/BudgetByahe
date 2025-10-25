import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminCMS.css';
import { auth, signOut, db, collection, doc, getDoc, setDoc } from '../firebase';
import AdminSidebar from './AdminSidebar';
import NotificationModal from '../components/NotificationModal';

function AdminCMS() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('success');

  const [cmsData, setCmsData] = useState({
    // Navbar
    navbarBrand: 'Budget Byahe',
    navbarLogo: '',
    
    // Hero Section
    heroTitle: 'Plan Your Journey, Budget Your Ride',
    heroSubtitle: 'Calculate transportation costs and discover the best routes across the Philippines',
    heroButtonText: 'Get Started',
    
    // Features
    feature1Title: 'Smart Fare Calculator',
    feature1Description: 'Instantly calculate transportation costs for jeepneys, tricycles, buses, and more',
    feature2Title: 'Route Discovery',
    feature2Description: 'Find the best routes and compare fares across different transportation modes',
    feature3Title: 'Real-time Updates',
    feature3Description: 'Stay informed with the latest fare rates and route information',
    
    // About
    aboutTitle: 'About Budget Byahe',
    aboutDescription: 'Your trusted companion for budget-friendly transportation planning in the Philippines',
    
    // Footer
    footerText: 'Making transportation planning easier for Filipinos',
    contactEmail: 'support@budgetbyahe.com',
    contactPhone: '+63 123 456 7890',
    
    // Social Media
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    
    // Colors
    primaryColor: '#0a5c36',
    secondaryColor: '#0d7a49',
    accentColor: '#fbbf24'
  });

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth !== 'true') {
      navigate('/admin/login');
      return;
    }
    loadCMSData();
  }, [navigate]);

  const loadCMSData = async () => {
    try {
      const cmsDoc = await getDoc(doc(db, 'settings', 'cms'));
      if (cmsDoc.exists()) {
        setCmsData(prev => ({
          ...prev,
          ...cmsDoc.data()
        }));
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading CMS data:', error);
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCmsData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCmsData(prev => ({
        ...prev,
        [fieldName]: event.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await setDoc(doc(db, 'settings', 'cms'), {
        ...cmsData,
        updatedAt: new Date()
      });

      setNotifType('success');
      setNotifMessage('Content updated successfully!');
      setShowNotif(true);
    } catch (error) {
      console.error('Error saving CMS data:', error);
      setNotifType('error');
      setNotifMessage('Failed to update content');
      setShowNotif(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (!window.confirm('Are you sure you want to reset all changes?')) return;
    loadCMSData();
    setNotifType('info');
    setNotifMessage('Changes have been reset');
    setShowNotif(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminId');
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('adminName');
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar activePage="cms" onLogout={handleLogout} />
      
      <div className="admin-main">
        <div className="admin-header">
          <div>
            <h1>Content Management</h1>
            <p>Edit website content and appearance</p>
          </div>
          <div className="header-actions">
            <button className="btn-reset" onClick={handleReset}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Reset Changes
            </button>
            <button 
              className="btn-save" 
              onClick={handleSave}
              disabled={isSaving}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="admin-loading">
            <div className="loading-spinner"></div>
            <p>Loading content...</p>
          </div>
        ) : (
          <div className="cms-container">
            <form onSubmit={handleSave}>
              {/* Navbar Section */}
              <div className="cms-section">
                <div className="section-header">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                  <h2>Navigation Bar</h2>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Brand Name</label>
                    <input
                      type="text"
                      name="navbarBrand"
                      value={cmsData.navbarBrand}
                      onChange={handleInputChange}
                      placeholder="Budget Byahe"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Logo</label>
                    <div className="image-upload-container">
                      {cmsData.navbarLogo && (
                        <div className="image-preview">
                          <img src={cmsData.navbarLogo} alt="Logo" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'navbarLogo')}
                        id="navbarLogo"
                      />
                      <label htmlFor="navbarLogo" className="file-label">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        Upload Logo
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Section */}
              <div className="cms-section">
                <div className="section-header">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  <h2>Hero Section</h2>
                </div>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Hero Title</label>
                    <input
                      type="text"
                      name="heroTitle"
                      value={cmsData.heroTitle}
                      onChange={handleInputChange}
                      placeholder="Plan Your Journey, Budget Your Ride"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Hero Subtitle</label>
                    <textarea
                      name="heroSubtitle"
                      value={cmsData.heroSubtitle}
                      onChange={handleInputChange}
                      placeholder="Calculate transportation costs..."
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label>Button Text</label>
                    <input
                      type="text"
                      name="heroButtonText"
                      value={cmsData.heroButtonText}
                      onChange={handleInputChange}
                      placeholder="Get Started"
                    />
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div className="cms-section">
                <div className="section-header">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                  <h2>Features</h2>
                </div>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Feature 1 Title</label>
                    <input
                      type="text"
                      name="feature1Title"
                      value={cmsData.feature1Title}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Feature 1 Description</label>
                    <textarea
                      name="feature1Description"
                      value={cmsData.feature1Description}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Feature 2 Title</label>
                    <input
                      type="text"
                      name="feature2Title"
                      value={cmsData.feature2Title}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Feature 2 Description</label>
                    <textarea
                      name="feature2Description"
                      value={cmsData.feature2Description}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Feature 3 Title</label>
                    <input
                      type="text"
                      name="feature3Title"
                      value={cmsData.feature3Title}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Feature 3 Description</label>
                    <textarea
                      name="feature3Description"
                      value={cmsData.feature3Description}
                      onChange={handleInputChange}
                      rows="2"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="cms-section">
                <div className="section-header">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <h2>Contact Information</h2>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={cmsData.contactEmail}
                      onChange={handleInputChange}
                      placeholder="support@budgetbyahe.com"
                    />
                  </div>

                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="contactPhone"
                      value={cmsData.contactPhone}
                      onChange={handleInputChange}
                      placeholder="+63 123 456 7890"
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>Footer Text</label>
                    <input
                      type="text"
                      name="footerText"
                      value={cmsData.footerText}
                      onChange={handleInputChange}
                      placeholder="Making transportation planning easier"
                    />
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="cms-section">
                <div className="section-header">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                  </svg>
                  <h2>Social Media Links</h2>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Facebook URL</label>
                    <input
                      type="url"
                      name="facebookUrl"
                      value={cmsData.facebookUrl}
                      onChange={handleInputChange}
                      placeholder="https://facebook.com/budgetbyahe"
                    />
                  </div>

                  <div className="form-group">
                    <label>Twitter URL</label>
                    <input
                      type="url"
                      name="twitterUrl"
                      value={cmsData.twitterUrl}
                      onChange={handleInputChange}
                      placeholder="https://twitter.com/budgetbyahe"
                    />
                  </div>

                  <div className="form-group">
                    <label>Instagram URL</label>
                    <input
                      type="url"
                      name="instagramUrl"
                      value={cmsData.instagramUrl}
                      onChange={handleInputChange}
                      placeholder="https://instagram.com/budgetbyahe"
                    />
                  </div>
                </div>
              </div>

              {/* Theme Colors */}
              <div className="cms-section">
                <div className="section-header">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
                  </svg>
                  <h2>Theme Colors</h2>
                </div>

                <div className="form-grid">
                  <div className="form-group color-input">
                    <label>Primary Color</label>
                    <div className="color-picker">
                      <input
                        type="color"
                        name="primaryColor"
                        value={cmsData.primaryColor}
                        onChange={handleInputChange}
                      />
                      <input
                        type="text"
                        value={cmsData.primaryColor}
                        onChange={handleInputChange}
                        name="primaryColor"
                      />
                    </div>
                  </div>

                  <div className="form-group color-input">
                    <label>Secondary Color</label>
                    <div className="color-picker">
                      <input
                        type="color"
                        name="secondaryColor"
                        value={cmsData.secondaryColor}
                        onChange={handleInputChange}
                      />
                      <input
                        type="text"
                        value={cmsData.secondaryColor}
                        onChange={handleInputChange}
                        name="secondaryColor"
                      />
                    </div>
                  </div>

                  <div className="form-group color-input">
                    <label>Accent Color</label>
                    <div className="color-picker">
                      <input
                        type="color"
                        name="accentColor"
                        value={cmsData.accentColor}
                        onChange={handleInputChange}
                      />
                      <input
                        type="text"
                        value={cmsData.accentColor}
                        onChange={handleInputChange}
                        name="accentColor"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {showNotif && (
        <NotificationModal
          type={notifType}
          message={notifMessage}
          onClose={() => setShowNotif(false)}
        />
      )}
    </div>
  );
}

export default AdminCMS;
