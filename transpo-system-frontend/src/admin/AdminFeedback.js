import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminFeedback.css';
import { auth, signOut, db, collection, getDocs, doc, updateDoc, deleteDoc } from '../firebase';
import AdminSidebar from './AdminSidebar';
import NotificationModal from '../components/NotificationModal';

function AdminFeedback() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotif, setShowNotif] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('success');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth !== 'true') {
      navigate('/admin/login');
      return;
    }
    loadFeedback();
  }, [navigate]);

  useEffect(() => {
    filterFeedbackData();
  }, [feedback, filterStatus, searchTerm]);

  const loadFeedback = async () => {
    try {
      const feedbackSnapshot = await getDocs(collection(db, 'feedback'));
      const feedbackData = feedbackSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by timestamp (newest first)
      feedbackData.sort((a, b) => {
        const dateA = a.timestamp?.toDate() || new Date(0);
        const dateB = b.timestamp?.toDate() || new Date(0);
        return dateB - dateA;
      });

      setFeedback(feedbackData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading feedback:', error);
      setNotifType('error');
      setNotifMessage('Failed to load feedback');
      setShowNotif(true);
      setIsLoading(false);
    }
  };

  const filterFeedbackData = () => {
    let filtered = [...feedback];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.userName?.toLowerCase().includes(term) ||
        item.userEmail?.toLowerCase().includes(term) ||
        item.message?.toLowerCase().includes(term) ||
        item.subject?.toLowerCase().includes(term)
      );
    }

    setFilteredFeedback(filtered);
  };

  const handleStatusChange = async (feedbackId, newStatus) => {
    try {
      await updateDoc(doc(db, 'feedback', feedbackId), {
        status: newStatus,
        updatedAt: new Date()
      });

      setFeedback(prev =>
        prev.map(item =>
          item.id === feedbackId ? { ...item, status: newStatus } : item
        )
      );

      setNotifType('success');
      setNotifMessage(`Feedback marked as ${newStatus}`);
      setShowNotif(true);
    } catch (error) {
      console.error('Error updating feedback status:', error);
      setNotifType('error');
      setNotifMessage('Failed to update status');
      setShowNotif(true);
    }
  };

  const handleDelete = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;

    try {
      await deleteDoc(doc(db, 'feedback', feedbackId));
      setFeedback(prev => prev.filter(item => item.id !== feedbackId));
      setShowDetailModal(false);
      setNotifType('success');
      setNotifMessage('Feedback deleted successfully!');
      setShowNotif(true);
    } catch (error) {
      console.error('Error deleting feedback:', error);
      setNotifType('error');
      setNotifMessage('Failed to delete feedback');
      setShowNotif(true);
    }
  };

  const openDetailModal = (item) => {
    setSelectedFeedback(item);
    setShowDetailModal(true);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending': return 'badge-pending';
      case 'reviewed': return 'badge-reviewed';
      case 'resolved': return 'badge-resolved';
      default: return 'badge-pending';
    }
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

  const stats = {
    total: feedback.length,
    pending: feedback.filter(f => f.status === 'pending').length,
    reviewed: feedback.filter(f => f.status === 'reviewed').length,
    resolved: feedback.filter(f => f.status === 'resolved').length
  };

  return (
    <div className="admin-layout">
      <AdminSidebar activePage="feedback" onLogout={handleLogout} />
      
      <div className="admin-main">
        <div className="admin-header">
          <div>
            <h1>User Feedback</h1>
            <p>Monitor and respond to user feedback</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="feedback-stats">
          <div className="stat-card">
            <div className="stat-icon all">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
            </div>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>Total Feedback</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="stat-info">
              <h3>{stats.pending}</h3>
              <p>Pending</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon reviewed">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="stat-info">
              <h3>{stats.reviewed}</h3>
              <p>Reviewed</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon resolved">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="stat-info">
              <h3>{stats.resolved}</h3>
              <p>Resolved</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="feedback-filters">
          <div className="search-box">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, or message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-buttons">
            <button
              className={filterStatus === 'all' ? 'active' : ''}
              onClick={() => setFilterStatus('all')}
            >
              All
            </button>
            <button
              className={filterStatus === 'pending' ? 'active' : ''}
              onClick={() => setFilterStatus('pending')}
            >
              Pending
            </button>
            <button
              className={filterStatus === 'reviewed' ? 'active' : ''}
              onClick={() => setFilterStatus('reviewed')}
            >
              Reviewed
            </button>
            <button
              className={filterStatus === 'resolved' ? 'active' : ''}
              onClick={() => setFilterStatus('resolved')}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* Feedback List */}
        {isLoading ? (
          <div className="admin-loading">
            <div className="loading-spinner"></div>
            <p>Loading feedback...</p>
          </div>
        ) : filteredFeedback.length === 0 ? (
          <div className="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
            </svg>
            <p>No feedback found</p>
            <span>Try adjusting your filters or search term</span>
          </div>
        ) : (
          <div className="feedback-table-container">
            <table className="feedback-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedback.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          {item.userName?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="user-name">{item.userName || 'Anonymous'}</div>
                          <div className="user-email">{item.userEmail || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="feedback-subject">{item.subject || 'No subject'}</div>
                    </td>
                    <td>
                      <div className="feedback-message-preview">
                        {item.message?.substring(0, 60) || 'No message'}
                        {item.message?.length > 60 ? '...' : ''}
                      </div>
                    </td>
                    <td>
                      <div className="feedback-date">{formatDate(item.timestamp)}</div>
                    </td>
                    <td>
                      <select
                        className={`status-select ${getStatusBadgeClass(item.status)}`}
                        value={item.status || 'pending'}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-view"
                          onClick={() => openDetailModal(item)}
                          title="View Details"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                        <button
                          className="btn-delete-small"
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedFeedback && (
          <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
            <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Feedback Details</h2>
                <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="modal-body">
                <div className="detail-section">
                  <label>User Information</label>
                  <div className="user-detail">
                    <div className="user-avatar large">
                      {selectedFeedback.userName?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="user-name">{selectedFeedback.userName || 'Anonymous'}</p>
                      <p className="user-email">{selectedFeedback.userEmail || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <label>Subject</label>
                  <p>{selectedFeedback.subject || 'No subject'}</p>
                </div>

                <div className="detail-section">
                  <label>Message</label>
                  <p className="feedback-message-full">{selectedFeedback.message || 'No message'}</p>
                </div>

                <div className="detail-section">
                  <label>Submitted</label>
                  <p>{formatDate(selectedFeedback.timestamp)}</p>
                </div>

                <div className="detail-section">
                  <label>Status</label>
                  <select
                    className={`status-select ${getStatusBadgeClass(selectedFeedback.status)}`}
                    value={selectedFeedback.status || 'pending'}
                    onChange={(e) => {
                      handleStatusChange(selectedFeedback.id, e.target.value);
                      setSelectedFeedback({ ...selectedFeedback, status: e.target.value });
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn-delete"
                  onClick={() => handleDelete(selectedFeedback.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  Delete Feedback
                </button>
                <button className="btn-close" onClick={() => setShowDetailModal(false)}>
                  Close
                </button>
              </div>
            </div>
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

export default AdminFeedback;
