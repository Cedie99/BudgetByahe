import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import './UserFeedbackHistory.css';

function UserFeedbackHistory() {
  const [currentUser, setCurrentUser] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        fetchUserFeedback(user.uid);
      } else {
        setLoading(false);
        setFeedbacks([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserFeedback = async (firebaseUid) => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${apiUrl}/feedback/user/${firebaseUid}`);
      const data = await response.json();

      if (data.success) {
        setFeedbacks(data.data);
      } else {
        setError(data.message || 'Failed to fetch feedback history');
      }
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('An error occurred while fetching your feedback history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'reviewed':
        return 'status-reviewed';
      case 'resolved':
        return 'status-resolved';
      default:
        return 'status-pending';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'suggestion':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
          </svg>
        );
      case 'bug':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
          </svg>
        );
      case 'fare_discrepancy':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.8 10.9C9.53 10.31 8.8 9.7 8.8 8.75C8.8 7.66 9.81 6.9 11.5 6.9C13.28 6.9 13.94 7.75 14 9H16.21C16.14 7.28 15.09 5.7 13 5.19V3H10V5.16C8.06 5.58 6.5 6.84 6.5 8.77C6.5 11.08 8.41 12.23 11.2 12.9C13.7 13.5 14.2 14.38 14.2 15.31C14.2 16 13.71 17.1 11.5 17.1C9.44 17.1 8.63 16.18 8.52 15H6.32C6.44 17.19 8.08 18.42 10 18.83V21H13V18.85C14.95 18.48 16.5 17.35 16.5 15.3C16.5 12.46 14.07 11.49 11.8 10.9Z" fill="currentColor"/>
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM18 14H6V12H18V14ZM18 11H6V9H18V11ZM18 8H6V6H18V8Z" fill="currentColor"/>
          </svg>
        );
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'suggestion': 'Suggestion',
      'bug': 'Bug Report',
      'fare_discrepancy': 'Fare Concern',
      'general': 'General Feedback'
    };
    return labels[category] || category;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredFeedbacks = filter === 'all' 
    ? feedbacks 
    : feedbacks.filter(f => f.status === filter);

  if (!currentUser) {
    return (
      <div className="feedback-history-section">
        <div className="feedback-history-container">
          <div className="not-logged-in">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
            </svg>
            <h3>Sign in to view your feedback history</h3>
            <p>Log in to see all the feedback you've submitted and track their status</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="feedback-history-section">
      <div className="feedback-history-container">
        <div className="history-header">
          <h2>Your Feedback History</h2>
          <p>Track the status of all your submitted feedback</p>
        </div>

        <div className="filter-controls">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All ({feedbacks.length})
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''} 
            onClick={() => setFilter('pending')}
          >
            Pending ({feedbacks.filter(f => f.status === 'pending').length})
          </button>
          <button 
            className={filter === 'reviewed' ? 'active' : ''} 
            onClick={() => setFilter('reviewed')}
          >
            Reviewed ({feedbacks.filter(f => f.status === 'reviewed').length})
          </button>
          <button 
            className={filter === 'resolved' ? 'active' : ''} 
            onClick={() => setFilter('resolved')}
          >
            Resolved ({feedbacks.filter(f => f.status === 'resolved').length})
          </button>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your feedback...</p>
          </div>
        )}

        {error && (
          <div className="error-state">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
            </svg>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && filteredFeedbacks.length === 0 && (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM18 14H6V12H18V14ZM18 11H6V9H18V11ZM18 8H6V6H18V8Z" fill="currentColor"/>
            </svg>
            <h3>No feedback found</h3>
            <p>You haven't submitted any feedback yet. Share your thoughts below!</p>
          </div>
        )}

        {!loading && !error && filteredFeedbacks.length > 0 && (
          <div className="feedback-list">
            {filteredFeedbacks.map((feedback) => (
              <div key={feedback.id} className="feedback-card">
                <div className="feedback-card-header">
                  <div className="category-badge">
                    {getCategoryIcon(feedback.category)}
                    <span>{getCategoryLabel(feedback.category)}</span>
                  </div>
                  <span className={`status-badge ${getStatusBadgeClass(feedback.status)}`}>
                    {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                  </span>
                </div>
                <div className="feedback-card-body">
                  <p>{feedback.message}</p>
                </div>
                <div className="feedback-card-footer">
                  <span className="feedback-date">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 13H11V7H13V13ZM15 11L17 13L15 15V11Z" fill="currentColor"/>
                    </svg>
                    {formatDate(feedback.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserFeedbackHistory;
