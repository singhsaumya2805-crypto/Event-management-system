import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function Registrations() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [registrations, setRegistrations] = useState([]);
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
    fetchRegistrations(parsedUser.user_id);
  }, [router]);

  const fetchRegistrations = async (userId) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/registrations?user_id=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setRegistrations(data);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (registrationId) => {
    if (!window.confirm('Are you sure you want to cancel this registration?')) {
      return;
    }
    try {
      const res = await fetch(`/api/registrations/${registrationId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setRegistrations((prev) => prev.filter((r) => r.registration_id !== registrationId));
        setMessage('Registration cancelled successfully.');
        setMessageType('success');
      } else {
        setMessage('Failed to cancel registration.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error cancelling registration:', error);
      setMessage('Error cancelling registration.');
      setMessageType('error');
    }
    setTimeout(() => setMessage(''), 4000);
  };

  if (loading || !user) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <div>
      <Navbar user={user} />
      <div style={{ paddingTop: '6rem', paddingBottom: '2rem', paddingLeft: '2rem', paddingRight: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>My Registrations</h1>

        {message && (
          <div style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            borderRadius: '8px',
            backgroundColor: messageType === 'success' ? '#dcfce7' : '#fee2e2',
            color: messageType === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${messageType === 'success' ? '#bbf7d0' : '#fecaca'}`
          }}>
            {message}
          </div>
        )}

        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Total Registrations: <strong>{registrations.length}</strong></p>

        {registrations.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '1rem' }}>You haven&apos;t registered for any events yet</p>
            <Link href="/events">
              <button style={{ padding: '0.6rem 1.2rem', cursor: 'pointer', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '500' }}>Browse Events</button>
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {registrations.map((reg) => (
              <div key={reg.registration_id} style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 0.75rem 0', color: '#1e293b' }}>{reg.event_name}</h3>
                <div style={{ display: 'grid', gap: '0.3rem' }}>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>📅 <strong>Date:</strong> {new Date(reg.event_date).toLocaleDateString()}</p>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>⏰ <strong>Time:</strong> {reg.event_time}</p>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>📍 <strong>Venue:</strong> {reg.venue}</p>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>📝 <strong>Registered On:</strong> {new Date(reg.registration_date).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => handleCancel(reg.registration_id)}
                  style={{ marginTop: '1rem', width: '100%', padding: '0.6rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                >
                  Cancel Registration
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
