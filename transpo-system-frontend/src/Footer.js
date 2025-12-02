import React from "react";
import "./Footer.css"; // optional: for styling
import useCMS from './hooks/useCMS';


const Footer = () => {
    const { cmsData, loading, error } = useCMS();
    
    return (
        <footer className="footer">
          <div className="footer-grid">
            <div className="footer-brand">
              <h2>{cmsData.navbarBrand || 'Budget Biyahe'}</h2>
              <p>{cmsData.footerText || 'Your smart travel companion for everyday commuting.'}</p>
              <div className="social-icons">
                {cmsData.facebookUrl && (
                  <a href={cmsData.facebookUrl} target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                )}
                {cmsData.twitterUrl && (
                  <a href={cmsData.twitterUrl} target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-twitter"></i>
                  </a>
                )}
                {cmsData.instagramUrl && (
                  <a href={cmsData.instagramUrl} target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-instagram"></i>
                  </a>
                )}
              </div>
            </div>

            <div className="footer-links">
              <h3>Explore</h3>
              <ul>
                <li><a href="/home">Home</a></li>
                <li><a href="#about-us">About Us</a></li>
                <li><a href="#choose-us">Why Choose Us</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </div>

            <div className="footer-contact">
              <h3>Get in Touch</h3>
              <p><i className="fas fa-envelope"></i> <a href={`mailto:${cmsData.contactEmail || 'support@budgetbyahe.com'}`}>{cmsData.contactEmail || 'support@budgetbyahe.com'}</a></p>
              <p><i className="fas fa-phone"></i> <a href={`tel:${cmsData.contactPhone || '+639001234567'}`}>{cmsData.contactPhone || '+63 900 123 4567'}</a></p>
              <p><i className="fas fa-map-marker-alt"></i> Bulacan, Philippines</p>
            </div>
          </div>

          <div className="footer-divider"></div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} <span>{cmsData.navbarBrand || 'Budget Biyahe'}</span> — All rights reserved.</p>
          </div>
        </footer>

    );
};

export default Footer;