import React from "react";
import "./Footer.css"; // optional: for styling


const Footer = () => {
    return (
        <footer className="footer">
          <div className="footer-grid">
            <div className="footer-brand">
              <h2>Budget Biyahe</h2>
              <p>Your smart travel companion for everyday commuting.</p>
              <div className="social-icons">
                <a href="#"><i className="fab fa-facebook-f"></i></a>
                <a href="#"><i className="fab fa-twitter"></i></a>
                <a href="#"><i className="fab fa-instagram"></i></a>
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
              <p><i className="fas fa-envelope"></i> <a href="mailto:support@budgetbyahe.com">support@budgetbyahe.com</a></p>
              <p><i className="fas fa-phone"></i> <a href="tel:+639001234567">+63 900 123 4567</a></p>
              <p><i className="fas fa-map-marker-alt"></i> Bulacan, Philippines</p>
            </div>
          </div>

          <div className="footer-divider"></div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} <span>Budget Biyahe</span> — All rights reserved.</p>
          </div>
        </footer>

    );
};

export default Footer;