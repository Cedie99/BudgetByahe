import React, { useState } from 'react';
import { auth } from '../firebase';
import './FeedbackForm.css';

function FeedbackForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'general',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'general', label: 'General Feedback' },
    { value: 'suggestion', label: 'Suggestion' },
    { value: 'bug', label: 'Report a Bug' },
    { value: 'fare_discrepancy', label: 'Fare Discrepancy' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const currentUser = auth.currentUser;
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      
      const payload = {
        user_name: formData.name,
        user_email: formData.email,
        category: formData.category,
        message: formData.message,
        firebase_uid: currentUser?.uid || null
      };

      const response = await fetch(`${apiUrl}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus({ type: 'success', message: data.message });
        // Reset form
        setFormData({
          name: '',
          email: '',
          category: 'general',
          message: ''
        });
      } else {
        setSubmitStatus({ 
          type: 'error', 
          message: data.message || 'Failed to submit feedback. Please try again.' 
        });
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus({ 
        type: 'error', 
        message: 'An error occurred. Please try again later.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="feedback-section" id="feedback">
      <div className="feedback-container">
        <div className="feedback-header">
          <h2>We'd Love to Hear From You</h2>
          <p>Your feedback helps us improve Budget Byahe for everyone</p>
        </div>

        <div className="feedback-content">
          <div className="feedback-info">
            <h3>How Can We Help?</h3>
            <div className="info-item">
              <div className="info-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="info-text">
                <h4>Share Suggestions</h4>
                <p>Have ideas to make Budget Byahe better? We're all ears!</p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="info-text">
                <h4>Report Issues</h4>
                <p>Found a bug or something not working right? Let us know.</p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.8 10.9C9.53 10.31 8.8 9.7 8.8 8.75C8.8 7.66 9.81 6.9 11.5 6.9C13.28 6.9 13.94 7.75 14 9H16.21C16.14 7.28 15.09 5.7 13 5.19V3H10V5.16C8.06 5.58 6.5 6.84 6.5 8.77C6.5 11.08 8.41 12.23 11.2 12.9C13.7 13.5 14.2 14.38 14.2 15.31C14.2 16 13.71 17.1 11.5 17.1C9.44 17.1 8.63 16.18 8.52 15H6.32C6.44 17.19 8.08 18.42 10 18.83V21H13V18.85C14.95 18.48 16.5 17.35 16.5 15.3C16.5 12.46 14.07 11.49 11.8 10.9Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="info-text">
                <h4>Fare Concerns</h4>
                <p>Notice incorrect fare calculations? Help us keep data accurate.</p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM18 14H6V12H18V14ZM18 11H6V9H18V11ZM18 8H6V6H18V8Z" fill="currentColor"/>
                </svg>
              </div>
              <div className="info-text">
                <h4>General Feedback</h4>
                <p>Any other comments or questions? We want to hear from you!</p>
              </div>
            </div>
          </div>

          <div className="feedback-form-wrapper">
            <form className="feedback-form" onSubmit={handleSubmit}>
              {submitStatus && (
                <div className={`alert alert-${submitStatus.type}`}>
                  {submitStatus.message}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="name">Your Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className={errors.name ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="email">Your Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className={errors.email ? 'error' : ''}
                  disabled={isSubmitting}
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="category">Category *</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="message">Your Message *</label>
                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us what's on your mind... (minimum 10 characters)"
                  className={errors.message ? 'error' : ''}
                  disabled={isSubmitting}
                ></textarea>
                {errors.message && <span className="error-message">{errors.message}</span>}
                <div className="char-count">
                  {formData.message.length} / 1000 characters
                </div>
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeedbackForm;
