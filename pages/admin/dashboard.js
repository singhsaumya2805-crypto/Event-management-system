import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

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
      fetchEvents();
    } catch (err) {
      router.push('/login');
    }
  }, [router]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? All registrations for this event will also be deleted.')) return;

    try {
      const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
      if (res.ok) {
        setEvents(events.filter(e => e.event_id !== eventId));
        setMessage('Event deleted successfully');
        setMessageType('success');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Failed to delete event');
        setMessageType('error');
      }
    } catch (err) {
      setMessage('Error deleting event');
      setMessageType('error');
    }
  };

  const handleViewParticipants = async (event) => {
    setSelectedEvent(event);
    setShowModal(true);
    setModalLoading(true);

    try {
      const res = await fetch(`/api/events/${event.event_id}/participants`);
      if (res.ok) {
        const data = await res.json();
        setParticipants(data);
      } else {
        setParticipants([]);
      }
    } catch (err) {
      console.error(err);
      setParticipants([]);
    } finally {
      setModalLoading(false);
    }
  };

  if (!user) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar user={user} />

      <div style={{ paddingTop: '6rem', paddingBottom: '2rem', paddingLeft: '2rem', paddingRight: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', margin: 0, color: '#1e293b' }}>Admin Dashboard</h1>
            <p style={{ color: '#64748b', margin: '0.25rem 0 0 0' }}>Manage events and participants</p>
          </div>
          <Link href="/admin/add-event">
            <button style={{ padding: '0.6rem 1.5rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '0.95rem' }}>
              + Add New Event
            </button>
          </Link>
        </div>

        {message && (
          <div style={{
            padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: '8px',
            backgroundColor: messageType === 'success' ? '#dcfce7' : '#fee2e2',
            color: messageType === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${messageType === 'success' ? '#bbf7d0' : '#fecaca'}`
          }}>
            {message}
          </div>
        )}

        <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f1f5f9' }}>
            <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Total Events: {events.length}</h2>
          </div>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading events...</div>
          ) : events.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <p>No events found.</p>
              <Link href="/admin/add-event" style={{ color: '#2563eb' }}>Create your first event</Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#1e3a5f', color: '#fff' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600' }}>Event Name</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600' }}>Date</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600' }}>Time</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600' }}>Venue</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.85rem', fontWeight: '600' }}>Capacity</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontSize: '0.85rem', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event, index) => (
                    <tr key={event.event_id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: index % 2 === 0 ? '#fff' : '#f8fafc' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: '500', color: '#1e293b' }}>{event.event_name}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{new Date(event.event_date).toLocaleDateString()}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{event.event_time}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{event.venue}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{event.capacity}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleViewParticipants(event)}
                          style={{ padding: '0.4rem 0.8rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '0.5rem', fontSize: '0.85rem' }}
                        >
                          Participants
                        </button>
                        <button
                          onClick={() => handleDelete(event.event_id)}
                          style={{ padding: '0.4rem 0.8rem', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Participants Modal */}
      {showModal && (
        <div
          onClick={() => setShowModal(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ backgroundColor: '#fff', borderRadius: '12px', width: '100%', maxWidth: '700px', maxHeight: '80vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}
          >
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#1e293b' }}>
                Participants — {selectedEvent?.event_name}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '1.5rem' }}>
              {modalLoading ? (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0' }}>Loading participants...</p>
              ) : participants.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0' }}>No registrations yet for this event.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                      <th style={{ padding: '0.6rem', textAlign: 'left', fontSize: '0.85rem', color: '#64748b' }}>Name</th>
                      <th style={{ padding: '0.6rem', textAlign: 'left', fontSize: '0.85rem', color: '#64748b' }}>Email</th>
                      <th style={{ padding: '0.6rem', textAlign: 'left', fontSize: '0.85rem', color: '#64748b' }}>Registration Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((p, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.6rem', color: '#1e293b' }}>{p.name}</td>
                        <td style={{ padding: '0.6rem', color: '#64748b' }}>{p.email}</td>
                        <td style={{ padding: '0.6rem', color: '#64748b' }}>{p.registration_date ? new Date(p.registration_date).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{ padding: '0.5rem 1.2rem', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
