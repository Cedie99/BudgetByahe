import React, { useState, useEffect } from 'react';
import './RoutesDisplay.css';

const RoutesDisplay = () => {
  const [routes, setRoutes] = useState([]);
  const [terminals, setTerminals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTransportType, setSelectedTransportType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    loadRoutesAndTerminals();
  }, []);

  const loadRoutesAndTerminals = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch routes and terminals in parallel
      const [routesResponse, terminalsResponse] = await Promise.all([
        fetch(`${apiUrl}/routes`),
        fetch(`${apiUrl}/terminals`)
      ]);

      if (!routesResponse.ok || !terminalsResponse.ok) {
        throw new Error('Failed to load data');
      }

      const routesData = await routesResponse.json();
      const terminalsData = await terminalsResponse.json();

      setRoutes(routesData.data || []);
      setTerminals(terminalsData.data || []);
    } catch (err) {
      console.error('Error loading routes:', err);
      setError('Failed to load routes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filterRoutes = () => {
    let filtered = routes;

    // Filter by transport type
    if (selectedTransportType !== 'all') {
      filtered = filtered.filter(
        route => route.transport_type?.type_name?.toLowerCase() === selectedTransportType
      );
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(route => 
        route.route_name?.toLowerCase().includes(search) ||
        route.start_terminal?.name?.toLowerCase().includes(search) ||
        route.end_terminal?.name?.toLowerCase().includes(search) ||
        route.start_terminal?.municipality?.toLowerCase().includes(search) ||
        route.end_terminal?.municipality?.toLowerCase().includes(search)
      );
    }

    return filtered;
  };

  const getTransportTypeIcon = (typeName) => {
    if (!typeName) {
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 16C4 16.88 4.39 17.67 5 18.22V20C5 20.55 5.45 21 6 21H7C7.55 21 8 20.55 8 20V19H16V20C16 20.55 16.45 21 17 21H18C18.55 21 19 20.55 19 20V18.22C19.61 17.67 20 16.88 20 16V6C20 2.5 16.42 2 12 2C7.58 2 4 2.5 4 6V16ZM6.5 15C5.67 15 5 14.33 5 13.5C5 12.67 5.67 12 6.5 12C7.33 12 8 12.67 8 13.5C8 14.33 7.33 15 6.5 15ZM17.5 15C16.67 15 16 14.33 16 13.5C16 12.67 16.67 12 17.5 12C18.33 12 19 12.67 19 13.5C19 14.33 18.33 15 17.5 15ZM5 10V6H19V10H5Z" fill="currentColor"/>
        </svg>
      );
    }
    switch (typeName.toLowerCase()) {
      case 'jeepney':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 16C4 16.88 4.39 17.67 5 18.22V20C5 20.55 5.45 21 6 21H7C7.55 21 8 20.55 8 20V19H16V20C16 20.55 16.45 21 17 21H18C18.55 21 19 20.55 19 20V18.22C19.61 17.67 20 16.88 20 16V6C20 2.5 16.42 2 12 2C7.58 2 4 2.5 4 6V16ZM6.5 15C5.67 15 5 14.33 5 13.5C5 12.67 5.67 12 6.5 12C7.33 12 8 12.67 8 13.5C8 14.33 7.33 15 6.5 15ZM17.5 15C16.67 15 16 14.33 16 13.5C16 12.67 16.67 12 17.5 12C18.33 12 19 12.67 19 13.5C19 14.33 18.33 15 17.5 15ZM5 10V6H19V10H5Z" fill="currentColor"/>
          </svg>
        );
      case 'tricycle':
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 5.5C16 6.88 14.88 8 13.5 8C12.12 8 11 6.88 11 5.5C11 4.12 12.12 3 13.5 3C14.88 3 16 4.12 16 5.5ZM18.5 16C19.88 16 21 17.12 21 18.5C21 19.88 19.88 21 18.5 21C17.12 21 16 19.88 16 18.5C16 17.12 17.12 16 18.5 16ZM5.5 16C6.88 16 8 17.12 8 18.5C8 19.88 6.88 21 5.5 21C4.12 21 3 19.88 3 18.5C3 17.12 4.12 16 5.5 16ZM14 9L12.5 13.5L16 12L21 18.5L19.5 20L15 14L11 15.5V21H9V14.5L5.5 16L4 13L11 10L14 9Z" fill="currentColor"/>
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 16C4 16.88 4.39 17.67 5 18.22V20C5 20.55 5.45 21 6 21H7C7.55 21 8 20.55 8 20V19H16V20C16 20.55 16.45 21 17 21H18C18.55 21 19 20.55 19 20V18.22C19.61 17.67 20 16.88 20 16V6C20 2.5 16.42 2 12 2C7.58 2 4 2.5 4 6V16ZM6.5 15C5.67 15 5 14.33 5 13.5C5 12.67 5.67 12 6.5 12C7.33 12 8 12.67 8 13.5C8 14.33 7.33 15 6.5 15ZM17.5 15C16.67 15 16 14.33 16 13.5C16 12.67 16.67 12 17.5 12C18.33 12 19 12.67 19 13.5C19 14.33 18.33 15 17.5 15ZM5 10V6H19V10H5Z" fill="currentColor"/>
          </svg>
        );
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'status-badge status-active';
      case 'inactive':
        return 'status-badge status-inactive';
      default:
        return 'status-badge';
    }
  };

  const filteredRoutes = filterRoutes();

  if (loading) {
    return (
      <div className="routes-display">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading routes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="routes-display">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={loadRoutesAndTerminals} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="routes-display">
      <div className="routes-header">
        <h2>Available Routes</h2>
        <p className="routes-subtitle">Explore transportation routes in Cebu</p>
      </div>

      <div className="routes-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search routes, terminals, or locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="currentColor"/>
            </svg>
          </span>
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${selectedTransportType === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedTransportType('all')}
          >
            All Routes
          </button>
          <button
            className={`filter-btn ${selectedTransportType === 'jeepney' ? 'active' : ''}`}
            onClick={() => setSelectedTransportType('jeepney')}
          >
            <span className="filter-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 16C4 16.88 4.39 17.67 5 18.22V20C5 20.55 5.45 21 6 21H7C7.55 21 8 20.55 8 20V19H16V20C16 20.55 16.45 21 17 21H18C18.55 21 19 20.55 19 20V18.22C19.61 17.67 20 16.88 20 16V6C20 2.5 16.42 2 12 2C7.58 2 4 2.5 4 6V16ZM6.5 15C5.67 15 5 14.33 5 13.5C5 12.67 5.67 12 6.5 12C7.33 12 8 12.67 8 13.5C8 14.33 7.33 15 6.5 15ZM17.5 15C16.67 15 16 14.33 16 13.5C16 12.67 16.67 12 17.5 12C18.33 12 19 12.67 19 13.5C19 14.33 18.33 15 17.5 15ZM5 10V6H19V10H5Z" fill="currentColor"/>
              </svg>
            </span>
            Jeepney
          </button>
          <button
            className={`filter-btn ${selectedTransportType === 'tricycle' ? 'active' : ''}`}
            onClick={() => setSelectedTransportType('tricycle')}
          >
            <span className="filter-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 5.5C16 6.88 14.88 8 13.5 8C12.12 8 11 6.88 11 5.5C11 4.12 12.12 3 13.5 3C14.88 3 16 4.12 16 5.5ZM18.5 16C19.88 16 21 17.12 21 18.5C21 19.88 19.88 21 18.5 21C17.12 21 16 19.88 16 18.5C16 17.12 17.12 16 18.5 16ZM5.5 16C6.88 16 8 17.12 8 18.5C8 19.88 6.88 21 5.5 21C4.12 21 3 19.88 3 18.5C3 17.12 4.12 16 5.5 16ZM14 9L12.5 13.5L16 12L21 18.5L19.5 20L15 14L11 15.5V21H9V14.5L5.5 16L4 13L11 10L14 9Z" fill="currentColor"/>
              </svg>
            </span>
            Tricycle
          </button>
        </div>
      </div>

      <div className="routes-count">
        <p>{filteredRoutes.length} route{filteredRoutes.length !== 1 ? 's' : ''} found</p>
      </div>

      {filteredRoutes.length === 0 ? (
        <div className="no-routes">
          <p>No routes found matching your criteria.</p>
        </div>
      ) : (
        <div className="routes-grid">
          {filteredRoutes.map((route) => (
            <div key={route.id} className="route-card">
              <div className="route-card-header">
                <div className="route-transport-icon">
                  {getTransportTypeIcon(route.transport_type?.type_name)}
                </div>
                <div className="route-title-section">
                  <h3 className="route-name">{route.route_name}</h3>
                  <span className={getStatusBadgeClass(route.status)}>
                    {route.status}
                  </span>
                </div>
              </div>

              <div className="route-card-body">
                <div className="route-info-row">
                  <div className="info-label">Transport Type:</div>
                  <div className="info-value">
                    {route.transport_type?.type_name || 'N/A'}
                  </div>
                </div>

                <div className="route-terminals">
                  <div className="terminal-item start-terminal">
                    <div className="terminal-marker">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className="terminal-details">
                      <div className="terminal-label">From</div>
                      <div className="terminal-name">
                        {route.start_terminal?.name || 'Unknown'}
                      </div>
                      <div className="terminal-location">
                        {route.start_terminal?.barangay && `${route.start_terminal.barangay}, `}
                        {route.start_terminal?.municipality || ''}
                      </div>
                    </div>
                  </div>

                  <div className="route-arrow">→</div>

                  <div className="terminal-item end-terminal">
                    <div className="terminal-marker">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className="terminal-details">
                      <div className="terminal-label">To</div>
                      <div className="terminal-name">
                        {route.end_terminal?.name || 'Unknown'}
                      </div>
                      <div className="terminal-location">
                        {route.end_terminal?.barangay && `${route.end_terminal.barangay}, `}
                        {route.end_terminal?.municipality || ''}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="route-info-row distance-row">
                  <div className="info-label">Distance:</div>
                  <div className="info-value distance-value">
                    {route.total_distance_km ? `${route.total_distance_km} km` : 'N/A'}
                  </div>
                </div>

                {route.route_points && route.route_points.length > 0 && (
                  <div className="route-waypoints">
                    <div className="waypoints-label">
                      Route Points: {route.route_points.length}
                    </div>
                    <div className="waypoints-list">
                      {route.route_points.slice(0, 3).map((point, index) => (
                        <span key={index} className="waypoint-tag">
                          {point.barangay_name || `Point ${point.order_no}`}
                        </span>
                      ))}
                      {route.route_points.length > 3 && (
                        <span className="waypoint-tag more">
                          +{route.route_points.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoutesDisplay;
