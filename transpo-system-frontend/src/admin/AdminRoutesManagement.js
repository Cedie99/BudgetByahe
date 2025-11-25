import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminRoutesManagement.css';
import AdminSidebar from './AdminSidebar';
import NotificationModal from '../components/NotificationModal';

function AdminRoutesManagement() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState([]);
  const [terminals, setTerminals] = useState([]);
  const [transportTypes, setTransportTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [notifMessage, setNotifMessage] = useState('');
  const [notifType, setNotifType] = useState('success');
  const [editingRoute, setEditingRoute] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTransportType, setFilterTransportType] = useState('all');

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  const [formData, setFormData] = useState({
    route_name: '',
    start_terminal_id: '',
    end_terminal_id: '',
    transport_type_id: '',
    total_distance_km: '',
    status: 'active'
  });

  useEffect(() => {
    const adminAuth = localStorage.getItem('adminAuth');
    if (adminAuth !== 'true') {
      navigate('/admin/login');
      return;
    }
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch routes, terminals, and transport types in parallel
      const [routesRes, terminalsRes] = await Promise.all([
        fetch(`${apiUrl}/routes`),
        fetch(`${apiUrl}/terminals`)
      ]);

      if (!routesRes.ok || !terminalsRes.ok) {
        throw new Error('Failed to load data');
      }

      const routesData = await routesRes.json();
      const terminalsData = await terminalsRes.json();

      setRoutes(routesData.data || []);
      setTerminals(terminalsData.data || []);

      // Extract unique transport types from terminals
      const types = [];
      const typeIds = new Set();
      terminalsData.data?.forEach(terminal => {
        if (terminal.transport_type && !typeIds.has(terminal.transport_type.id)) {
          typeIds.add(terminal.transport_type.id);
          types.push(terminal.transport_type);
        }
      });
      setTransportTypes(types);

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      showNotification('Failed to load data', 'error');
      setIsLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotifMessage(message);
    setNotifType(type);
    setShowNotif(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.route_name || !formData.start_terminal_id || !formData.end_terminal_id || !formData.transport_type_id) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    if (formData.start_terminal_id === formData.end_terminal_id) {
      showNotification('Start and end terminals must be different', 'error');
      return;
    }

    try {
      const method = editingRoute ? 'PUT' : 'POST';
      const url = editingRoute 
        ? `${apiUrl}/routes/${editingRoute.id}`
        : `${apiUrl}/routes`;

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route_name: formData.route_name,
          start_terminal_id: parseInt(formData.start_terminal_id),
          end_terminal_id: parseInt(formData.end_terminal_id),
          transport_type_id: parseInt(formData.transport_type_id),
          total_distance_km: parseFloat(formData.total_distance_km) || 0,
          status: formData.status
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save route');
      }

      showNotification(
        editingRoute ? 'Route updated successfully!' : 'Route added successfully!',
        'success'
      );

      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving route:', error);
      showNotification(error.message || 'Failed to save route', 'error');
    }
  };

  const handleEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      route_name: route.route_name,
      start_terminal_id: route.start_terminal_id,
      end_terminal_id: route.end_terminal_id,
      transport_type_id: route.transport_type_id,
      total_distance_km: route.total_distance_km,
      status: route.status
    });
    setShowModal(true);
  };

  const handleDelete = async (routeId) => {
    if (!window.confirm('Are you sure you want to delete this route?')) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/routes/${routeId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete route');
      }

      showNotification('Route deleted successfully!', 'success');
      loadData();
    } catch (error) {
      console.error('Error deleting route:', error);
      showNotification('Failed to delete route', 'error');
    }
  };

  const handleStatusToggle = async (route) => {
    try {
      const newStatus = route.status === 'active' ? 'inactive' : 'active';
      
      const response = await fetch(`${apiUrl}/routes/${route.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...route,
          status: newStatus
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update route status');
      }

      showNotification(`Route ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`, 'success');
      loadData();
    } catch (error) {
      console.error('Error updating route status:', error);
      showNotification('Failed to update route status', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      route_name: '',
      start_terminal_id: '',
      end_terminal_id: '',
      transport_type_id: '',
      total_distance_km: '',
      status: 'active'
    });
    setEditingRoute(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('adminAuth');
      navigate('/admin/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getFilteredRoutes = () => {
    return routes.filter(route => {
      const matchesStatus = filterStatus === 'all' || route.status === filterStatus;
      const matchesTransportType = filterTransportType === 'all' || 
        route.transport_type_id === parseInt(filterTransportType);
      return matchesStatus && matchesTransportType;
    });
  };

  const getTerminalName = (terminalId) => {
    const terminal = terminals.find(t => t.id === terminalId);
    return terminal ? terminal.name : 'Unknown';
  };

  const getTransportTypeName = (typeId) => {
    const type = transportTypes.find(t => t.id === typeId);
    return type ? type.type_name : 'Unknown';
  };

  const filteredRoutes = getFilteredRoutes();

  return (
    <div className="admin-routes-management">
      <AdminSidebar onLogout={handleLogout} />
      
      <div className="admin-content">
        <div className="admin-header">
          <h1>Routes Management</h1>
          <button className="btn-add-route" onClick={openAddModal}>
            + Add New Route
          </button>
        </div>

        {/* Filters */}
        <div className="routes-filters-admin">
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Transport Type:</label>
            <select 
              value={filterTransportType} 
              onChange={(e) => setFilterTransportType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              {transportTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.type_name}
                </option>
              ))}
            </select>
          </div>

          <div className="routes-count-admin">
            {filteredRoutes.length} route{filteredRoutes.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Routes Table */}
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading routes...</p>
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="empty-state">
            <p>No routes found. Click "Add New Route" to create one.</p>
          </div>
        ) : (
          <div className="routes-table-container">
            <table className="routes-table">
              <thead>
                <tr>
                  <th>Route Name</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Transport Type</th>
                  <th>Distance (km)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoutes.map(route => (
                  <tr key={route.id}>
                    <td className="route-name-cell">{route.route_name}</td>
                    <td>{route.start_terminal?.name || getTerminalName(route.start_terminal_id)}</td>
                    <td>{route.end_terminal?.name || getTerminalName(route.end_terminal_id)}</td>
                    <td>
                      <span className="transport-type-badge">
                        {route.transport_type?.type_name || getTransportTypeName(route.transport_type_id)}
                      </span>
                    </td>
                    <td>{route.total_distance_km || 'N/A'}</td>
                    <td>
                      <button
                        className={`status-toggle ${route.status}`}
                        onClick={() => handleStatusToggle(route)}
                      >
                        {route.status === 'active' ? '● Active' : '○ Inactive'}
                      </button>
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEdit(route)}
                        title="Edit Route"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(route.id)}
                        title="Delete Route"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingRoute ? 'Edit Route' : 'Add New Route'}</h2>
                <button className="btn-close" onClick={closeModal}>×</button>
              </div>
              
              <form onSubmit={handleSubmit} className="route-form">
                <div className="form-group">
                  <label htmlFor="route_name">Route Name *</label>
                  <input
                    type="text"
                    id="route_name"
                    name="route_name"
                    value={formData.route_name}
                    onChange={handleInputChange}
                    placeholder="e.g., Ayala - SM Seaside"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="start_terminal_id">Start Terminal *</label>
                    <select
                      id="start_terminal_id"
                      name="start_terminal_id"
                      value={formData.start_terminal_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Start Terminal</option>
                      {terminals.map(terminal => (
                        <option key={terminal.id} value={terminal.id}>
                          {terminal.name} ({terminal.municipality})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="end_terminal_id">End Terminal *</label>
                    <select
                      id="end_terminal_id"
                      name="end_terminal_id"
                      value={formData.end_terminal_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select End Terminal</option>
                      {terminals.map(terminal => (
                        <option key={terminal.id} value={terminal.id}>
                          {terminal.name} ({terminal.municipality})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="transport_type_id">Transport Type *</label>
                    <select
                      id="transport_type_id"
                      name="transport_type_id"
                      value={formData.transport_type_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Select Transport Type</option>
                      {transportTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.type_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="total_distance_km">Distance (km)</label>
                    <input
                      type="number"
                      id="total_distance_km"
                      name="total_distance_km"
                      value={formData.total_distance_km}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={closeModal}>
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

        {/* Notification Modal */}
        {showNotif && (
          <NotificationModal
            message={notifMessage}
            type={notifType}
            onClose={() => setShowNotif(false)}
          />
        )}
      </div>
    </div>
  );
}

export default AdminRoutesManagement;
