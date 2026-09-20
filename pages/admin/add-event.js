import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function AddEvent() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [venue, setVenue] = useState('');
  const [capacity, setCapacity] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Get today's date for min attribute
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser.role !== 'ADMIN') {
        router.push('/dashboard');
        return;
      }
      setUser(parsedUser);
    } catch (err) {
      router.push('/login');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: eventName,
          description: description,
          event_date: eventDate,
          event_time: eventTime,
          venue: venue,
          capacity: parseInt(capacity, 10)
        }),
      });

      if (res.ok) {
        setMessage('Event added successfully!');
        setMessageType('success');
        // Clear form
        setEventName('');
        setDescription('');
        setEventDate('');
        setEventTime('');
        setVenue('');
        setCapacity('');
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage(data.message || 'Failed to add event');
        setMessageType('error');
      }
    } catch (err) {
      setMessage('An error occurred while adding the event');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;

  const inputStyle = {
    width: '100%',
    padding: '0.6rem 0.8rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.95rem',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.35rem',
    fontWeight: '500',
    color: '#374151',
    fontSize: '0.9rem'
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar user={user} />

      <div style={{ paddingTop: '6rem', paddingBottom: '2rem', paddingLeft: '2rem', paddingRight: '2rem', maxWidth: '650px', margin: '0 auto' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/admin/dashboard" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Back to Dashboard
          </Link>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f1f5f9' }}>
            <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#1e293b' }}>Add New Event</h1>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {message && (
              <div style={{
                padding: '0.75rem 1rem', marginBottom: '1.25rem', borderRadius: '8px',
                backgroundColor: messageType === 'success' ? '#dcfce7' : '#fee2e2',
                color: messageType === 'success' ? '#166534' : '#991b1b',
                border: `1px solid ${messageType === 'success' ? '#bbf7d0' : '#fecaca'}`
              }}>
                <p style={{ margin: 0 }}>{message}</p>
                {messageType === 'success' && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <Link href="/admin/dashboard" style={{ color: '#166534', fontWeight: '500' }}>
                      Return to Dashboard
                    </Link>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>Event Name *</label>
                <input
                  type="text"
                  required
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g., Annual Tech Symposium"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={labelStyle}>Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details about the event..."
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={labelStyle}>Event Date *</label>
                  <input
                    type="date"
                    required
                    min={today}
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Event Time *</label>
                  <input
                    type="time"
                    required
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={labelStyle}>Venue *</label>
                  <input
                    type="text"
                    required
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="e.g., Main Auditorium"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Capacity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="e.g., 200"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '0.7rem 2rem',
                    backgroundColor: loading ? '#93c5fd' : '#2563eb',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
                    fontSize: '1rem'
                  }}
                >
                  {loading ? 'Adding...' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
