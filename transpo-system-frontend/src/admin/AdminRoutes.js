import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminRoutes.css';
import { auth, signOut, db, collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from '../firebase';
import AdminSidebar from './AdminSidebar';
import NotificationModal from '../components/NotificationModal';

function AdminRoutes() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('success');
  const [editingRoute, setEditingRoute] = useState(null);

  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    vehicleType: 'Jeepney',
    baseFare: '',
    perKmRate: '',
    distance: '',
    estimatedFare: '',
    status: 'active'
  });

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth !== 'true') {
      navigate('/admin/login');
      return;
    }
    loadRoutes();
  }, [navigate]);

  const loadRoutes = async () => {
    try {
      const routesSnapshot = await getDocs(collection(db, 'routes'));
      const routesData = routesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRoutes(routesData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading routes:', error);
      setNotifType('error');
      setNotifMessage('Failed to load routes');
      setShowNotif(true);
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateFare = () => {
    const base = parseFloat(formData.baseFare) || 0;
    const rate = parseFloat(formData.perKmRate) || 0;
    const dist = parseFloat(formData.distance) || 0;
    const estimated = base + (rate * dist);
    setFormData(prev => ({
      ...prev,
      estimatedFare: estimated.toFixed(2)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const routeData = {
        ...formData,
        baseFare: parseFloat(formData.baseFare),
        perKmRate: parseFloat(formData.perKmRate),
        distance: parseFloat(formData.distance),
        estimatedFare: parseFloat(formData.estimatedFare),
        updatedAt: new Date()
      };

      if (editingRoute) {
        await updateDoc(doc(db, 'routes', editingRoute.id), routeData);
        setNotifMessage('Route updated successfully!');
      } else {
        await addDoc(collection(db, 'routes'), {
          ...routeData,
          createdAt: new Date()
        });
        setNotifMessage('Route added successfully!');
      }

      setNotifType('success');
      setShowNotif(true);
      setShowModal(false);
      resetForm();
      loadRoutes();
    } catch (error) {
      console.error('Error saving route:', error);
      setNotifType('error');
      setNotifMessage('Failed to save route');
      setShowNotif(true);
    }
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      origin: route.origin,
      destination: route.destination,
      vehicleType: route.vehicleType,
      baseFare: route.baseFare.toString(),
      perKmRate: route.perKmRate.toString(),
      distance: route.distance.toString(),
      estimatedFare: route.estimatedFare.toString(),
      status: route.status
    });
    setShowModal(true);
  };

  const handleDelete = async (routeId) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;

    try {
      await deleteDoc(doc(db, 'routes', routeId));
      setNotifType('success');
      setNotifMessage('Route deleted successfully!');
      setShowNotif(true);
      loadRoutes();
    } catch (error) {
      console.error('Error deleting route:', error);
      setNotifType('error');
      setNotifMessage('Failed to delete route');
      setShowNotif(true);
    }
  };

  const resetForm = () => {
    setFormData({
      origin: '',
      destination: '',
      vehicleType: 'Jeepney',
      baseFare: '',
      perKmRate: '',
      distance: '',
      estimatedFare: '',
      status: 'active'
    });
    setEditingRoute(null);
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
      <AdminSidebar activePage="routes" onLogout={handleLogout} />
      
      <div className="admin-main">
        <div className="admin-header">
          <div>
            <h1>Routes Management</h1>
            <p>Manage and upload transportation routes</p>
          </div>
          <button 
            className="btn-add-route"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add New Route
          </button>
        </div>

        {isLoading ? (
          <div className="admin-loading">
            <div className="loading-spinner"></div>
            <p>Loading routes...</p>
          </div>
        ) : (
          <div className="routes-container">
            {routes.length === 0 ? (
              <div className="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                </svg>
                <p>No routes available</p>
                <button className="btn-add-route" onClick={() => setShowModal(true)}>
                  Add Your First Route
                </button>
              </div>
            ) : (
              <div className="routes-grid">
                {routes.map((route) => (
                  <div key={route.id} className="route-card">
                    <div className="route-header">
                      <div className="route-type-badge">{route.vehicleType}</div>
                      <span className={`status-badge ${route.status}`}>{route.status}</span>
                    </div>
                    
                    <div className="route-path">
                      <div className="route-location">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                        <span>{route.origin}</span>
                      </div>
                      
                      <div className="route-arrow">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </div>
                      
                      <div className="route-location">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                        <span>{route.destination}</span>
                      </div>
                    </div>

                    <div className="route-details">
                      <div className="detail-item">
                        <span className="detail-label">Distance</span>
                        <span className="detail-value">{route.distance} km</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Base Fare</span>
                        <span className="detail-value">₱{route.baseFare}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Per KM</span>
                        <span className="detail-value">₱{route.perKmRate}</span>
                      </div>
                      <div className="detail-item highlight">
                        <span className="detail-label">Estimated Fare</span>
                        <span className="detail-value">₱{route.estimatedFare}</span>
                      </div>
                    </div>

                    <div className="route-actions">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEdit(route)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                        Edit
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(route.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Route Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingRoute ? 'Edit Route' : 'Add New Route'}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form className="modal-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Origin</label>
                    <input
                      type="text"
                      name="origin"
                      value={formData.origin}
                      onChange={handleInputChange}
                      placeholder="e.g., Manila"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Destination</label>
                    <input
                      type="text"
                      name="destination"
                      value={formData.destination}
                      onChange={handleInputChange}
                      placeholder="e.g., Quezon City"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Vehicle Type</label>
                    <select
                      name="vehicleType"
                      value={formData.vehicleType}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Jeepney">Jeepney</option>
                      <option value="Tricycle">Tricycle</option>
                      <option value="Bus">Bus</option>
                      <option value="UV Express">UV Express</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Base Fare (₱)</label>
                    <input
                      type="number"
                      name="baseFare"
                      value={formData.baseFare}
                      onChange={handleInputChange}
                      placeholder="e.g., 12"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Per KM Rate (₱)</label>
                    <input
                      type="number"
                      name="perKmRate"
                      value={formData.perKmRate}
                      onChange={handleInputChange}
                      placeholder="e.g., 1.50"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Distance (km)</label>
                    <input
                      type="number"
                      name="distance"
                      value={formData.distance}
                      onChange={handleInputChange}
                      onBlur={calculateFare}
                      placeholder="e.g., 10"
                      step="0.1"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Estimated Fare (₱)</label>
                  <input
                    type="number"
                    name="estimatedFare"
                    value={formData.estimatedFare}
                    onChange={handleInputChange}
                    placeholder="Auto-calculated"
                    step="0.01"
                    required
                  />
                  <button 
                    type="button" 
                    className="btn-calculate"
                    onClick={calculateFare}
                  >
                    Calculate Fare
                  </button>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit">
                    {editingRoute ? 'Update Route' : 'Add Route'}
                  </button>
                </div>
              </form>
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

export default AdminRoutes;
