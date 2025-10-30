import { useState, useEffect } from 'react';
import { db, doc, getDoc, onSnapshot } from '../firebase';

// Custom hook to fetch and subscribe to CMS data
export const useCMS = () => {
  const [cmsData, setCmsData] = useState({
    // Default values (fallback)
    navbarBrand: 'Budget Byahe',
    navbarLogo: '',
    
    heroTitle: 'Plan Your Journey, Budget Your Ride',
    heroSubtitle: 'Calculate transportation costs and discover the best routes across the Philippines',
    heroButtonText: 'Get Started',
    
    feature1Title: 'Smart Fare Calculator',
    feature1Description: 'Instantly calculate transportation costs for jeepneys, tricycles, buses, and more',
    feature2Title: 'Route Discovery',
    feature2Description: 'Find the best routes and compare fares across different transportation modes',
    feature3Title: 'Real-time Updates',
    feature3Description: 'Stay informed with the latest fare rates and route information',
    
    aboutTitle: 'About Budget Byahe',
    aboutDescription: 'Your trusted companion for budget-friendly transportation planning in the Philippines',
    
    footerText: 'Making transportation planning easier for Filipinos',
    contactEmail: 'support@budgetbyahe.com',
    contactPhone: '+63 123 456 7890',
    
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    
    primaryColor: '#0a5c36',
    secondaryColor: '#0d7a49',
    accentColor: '#fbbf24'
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'cms'),
      (docSnap) => {
        if (docSnap.exists()) {
          setCmsData(prev => ({
            ...prev,
            ...docSnap.data()
          }));
          
          // Apply theme colors to CSS variables
          const data = docSnap.data();
          if (data.primaryColor) {
            document.documentElement.style.setProperty('--cms-primary-color', data.primaryColor);
          }
          if (data.secondaryColor) {
            document.documentElement.style.setProperty('--cms-secondary-color', data.secondaryColor);
          }
          if (data.accentColor) {
            document.documentElement.style.setProperty('--cms-accent-color', data.accentColor);
          }
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching CMS data:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { cmsData, loading, error };
};

export default useCMS;
