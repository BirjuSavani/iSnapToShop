import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import urlJoin from 'url-join';
import '../style/CardList.css';

const API_BASE_URL = window.location.origin;

const CardList = () => {
  const { application_id, company_id } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data from API
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get(
          urlJoin(API_BASE_URL, '/api/application/all-applications'),
          {
            params: {
              company_id: company_id,
              application_id: application_id,
            },
            headers: {
              // Add any required headers like authentication
            },
          }
        );
        console.log(response, '11111111');

        setItems(
          response.data.map(app => ({
            id: app._id, // Using _id from MongoDB
            logo: app.logo || app.name.substring(0, 2).toUpperCase(), // Use provided logo or generate from name
            title: app.name,
            url: app.domain || `${app.name.toLowerCase().replace(/\s+/g, '-')}.fynd.io`, // Generate URL if not provided
            active: app.is_active || false, // Default to false if not specified
            company_id: app.company_id || company_id, // Fallback to URL param
            application_id: app.application_id || application_id, // Fallback to URL param
          }))
        );
      } catch (err) {
        setError(err.message || 'Failed to fetch applications');
      } finally {
        setLoading(false);
      }
    };

    if (company_id) {
      fetchApplications();
    }
  }, [company_id, application_id]);

  const toggleStatus = async id => {
    try {
      setLoading(true);
      const item = items.find(item => item.id === id);
      const newActiveStatus = !item.active;

      const endpoint = newActiveStatus ? '/api/scan/init-index' : '/api/scan/remove-index';

      console.log('Toggling item:', {
        id: item.id,
        application_id: item.id, // Log the application_id being used
        company_id: company_id,
      });

      await axios.post(
        urlJoin(API_BASE_URL, endpoint),
        {},
        {
          headers: { 'x-company-id': item.company_id }, // Use item's company_id
          params: {
            application_id: item.id, // Use item's application_id
            company_id: company_id, // Use item's company_id
          },
        }
      );

      setItems(items.map(item => (item.id === id ? { ...item, active: newActiveStatus } : item)));
    } catch (error) {
      console.error('Error toggling status:', {
        error: error.response?.data || error,
        itemId: id,
        application_id: items.find(item => item.id === id)?.application_id,
      });
      setError(error.response?.data?.message || error.message || 'Toggle operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className='loading'>Loading applications...</div>;
  if (error) return <div className='error'>Error: {error}</div>;
  if (!items.length) return <div className='empty'>No applications found</div>;

  return (
    <div className='grid-container'>
      <h1 className='main-title'>iSnapToShop</h1>
      <div className='card-grid'>
        {items.map(item => (
          <div key={item.id} className='grid-card'>
            {item.logo && item.logo.startsWith('http') ? (
              <img src={item.logo} alt='app-logo' className='card-logo-img' />
            ) : (
              <div className='card-logo'>{item.logo}</div>
            )}
            <div className='card-content'>
              <h3 className='card-title'>{item.title}</h3>
              <p className='card-url'>{item.url}</p>
            </div>
            <div className='card-actions'>
              <button
                className={`status-btn ${item.active ? 'active' : 'inactive'}`}
                onClick={() => toggleStatus(item.id)}
                disabled={loading}
              >
                {item.active ? 'ACTIVE' : 'INACTIVE'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardList;
