import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';

export default function Events() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userStr);
    setUser(parsedUser);
    fetchEvents();
  }, [router]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchEvents();
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/events/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error searching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSearchQuery('');
    fetchEvents();
  };

  const handleRegister = async (eventId) => {
    setMessage('');
    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id, event_id: eventId })
      });

      if (res.status === 201) {
        setMessage('Successfully registered for the event!');
        setMessageType('success');
      } else if (res.status === 409) {
        setMessage('You are already registered for this event.');
        setMessageType('warning');
      } else {
        setMessage('Error registering for event.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error registering:', error);
      setMessage('Error registering for event.');
      setMessageType('error');
    }

    setTimeout(() => setMessage(''), 4000);
  };

  if (!user) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <div>
      <Navbar user={user} />
      <div style={{ paddingTop: '6rem', paddingBottom: '2rem', paddingLeft: '2rem', paddingRight: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Browse Events</h1>

        {message && (
          <div style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            borderRadius: '8px',
            backgroundColor: messageType === 'success' ? '#dcfce7' : messageType === 'warning' ? '#fef3c7' : '#fee2e2',
            color: messageType === 'success' ? '#166534' : messageType === 'warning' ? '#92400e' : '#991b1b',
            border: `1px solid ${messageType === 'success' ? '#bbf7d0' : messageType === 'warning' ? '#fde68a' : '#fecaca'}`
          }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSearch} style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search by name, description, or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ padding: '0.6rem 1rem', flex: 1, minWidth: '200px', maxWidth: '400px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.95rem' }}
          />
          <button type="submit" style={{ padding: '0.6rem 1.2rem', cursor: 'pointer', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '500' }}>Search</button>
          <button type="button" onClick={handleClear} style={{ padding: '0.6rem 1.2rem', cursor: 'pointer', backgroundColor: '#fff', color: '#64748b', border: '1px solid #d1d5db', borderRadius: '6px' }}>Clear</button>
        </form>

        {loading ? (
          <p style={{ color: '#64748b' }}>Loading events...</p>
        ) : events.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#64748b', fontSize: '1.1rem' }}>No events found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {events.map((evt) => (
              <div key={evt.event_id} style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1.15rem' }}>{evt.event_name}</h3>
                <p style={{ margin: '0.25rem 0', color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>{evt.description}</p>
                <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                  <p style={{ margin: 0, color: '#475569', fontSize: '0.85rem' }}>📅 {new Date(evt.event_date).toLocaleDateString()}</p>
                  <p style={{ margin: 0, color: '#475569', fontSize: '0.85rem' }}>⏰ {evt.event_time}</p>
                  <p style={{ margin: 0, color: '#475569', fontSize: '0.85rem' }}>📍 {evt.venue}</p>
                  <p style={{ margin: 0, color: '#475569', fontSize: '0.85rem' }}>👥 Capacity: {evt.capacity}</p>
                </div>
                <button
                  onClick={() => handleRegister(evt.event_id)}
                  style={{ marginTop: '1rem', width: '100%', padding: '0.6rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '0.95rem' }}
                >
                  Register for Event
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
