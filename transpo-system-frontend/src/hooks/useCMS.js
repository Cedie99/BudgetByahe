import { useState, useEffect } from 'react';

// Custom hook to fetch CMS data from backend API
export const useCMS = () => {
  const [cmsData, setCmsData] = useState({
    // Default values (fallback) - matching production website
    navbarBrand: 'Budget Biyahe',
    navbarLogo: '',
    
    heroTitle: 'Smart Fare Calculation for Tricycles & Jeepneys',
    heroSubtitle: 'Empowering commuters with accurate, fair, and easy-to-understand fare calculations for every ride.',
    heroButtonText: 'Find My Route',
    
    feature1Title: 'Seamless Fare Updates',
    feature1Description: 'Stay informed with automatically updated fare rates for your routes and destinations.',
    feature2Title: 'Smart Route Assistance',
    feature2Description: 'Discover the best and most affordable route combinations with real-time mapping.',
    feature3Title: '24/7 Fare Access',
    feature3Description: 'Access fare information anytime, anywhere — whether online or on-the-go.',
    
    aboutTitle: 'About Budget Biyahe',
    aboutDescription: 'Budget Biyahe is a Transparent Fare Calculation System for Tricycle and Jeepney Services, aims to revolutionize local public transportation by providing commuters and drivers with a fair, accurate, and easy-to-use fare calculation platform. By leveraging modern web technologies and real-time data, our system ensures transparency in fare computation, reduces disputes, and promotes trust between passengers and drivers.',
    
    footerText: 'Your smart travel companion for everyday commuting.',
    contactEmail: 'support@budgetbyahe.com',
    contactPhone: '+63 900 123 4567',
    
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    
    primaryColor: '#0a5c36',
    secondaryColor: '#0d7a49',
    accentColor: '#fbbf24'
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch from Laravel backend
  const fetchFromBackend = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/cms/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Convert the backend format to camelCase
          const backendData = {};
          for (const [key, value] of Object.entries(data.data)) {
            // Convert snake_case to camelCase
            const camelKey = key.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
            backendData[camelKey] = value;
          }
          
          setCmsData(prev => ({
            ...prev,
            ...backendData
          }));

          // Apply theme colors
          if (backendData.primaryColor) {
            document.documentElement.style.setProperty('--cms-primary-color', backendData.primaryColor);
          }
          if (backendData.secondaryColor) {
            document.documentElement.style.setProperty('--cms-secondary-color', backendData.secondaryColor);
          }
          if (backendData.accentColor) {
            document.documentElement.style.setProperty('--cms-accent-color', backendData.accentColor);
          }
        }
      }
    } catch (error) {
      console.error('Backend CMS fetch failed:', error);
      setError(error);
    }
  };

  // Function to refresh CMS data (can be called after updates)
  const refreshData = async () => {
    await fetchFromBackend();
  };

  useEffect(() => {
    // Load CMS data from backend on component mount
    const loadData = async () => {
      setLoading(true);
      await fetchFromBackend();
      setLoading(false);
    };

    loadData();
  }, []);

  return { cmsData, loading, error, refreshData };
};

export default useCMS;
