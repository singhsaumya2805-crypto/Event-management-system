import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userStr);
    if (parsedUser.role === 'ADMIN') {
      router.push('/admin/dashboard');
      return;
    }
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

  if (loading || !user) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingEventsCount = registrations.filter((reg) => {
    return new Date(reg.event_date) >= today;
  }).length;

  return (
    <div>
      <Navbar user={user} />
      <div style={{ paddingTop: '6rem', paddingBottom: '2rem', paddingLeft: '2rem', paddingRight: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Welcome, {user.name}!</h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Your Event Dashboard</p>

        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <div style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#fff', minWidth: '200px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Registrations</h3>
            <p style={{ fontSize: '2.5rem', margin: 0, fontWeight: 'bold', color: '#2563eb' }}>{registrations.length}</p>
          </div>
          <div style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#fff', minWidth: '200px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Upcoming Events</h3>
            <p style={{ fontSize: '2.5rem', margin: 0, fontWeight: 'bold', color: '#10b981' }}>{upcomingEventsCount}</p>
          </div>
        </div>

        <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
          <Link href="/events">
            <button style={{ padding: '0.6rem 1.2rem', cursor: 'pointer', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '500' }}>Browse Events</button>
          </Link>
          <Link href="/registrations">
            <button style={{ padding: '0.6rem 1.2rem', cursor: 'pointer', backgroundColor: '#fff', color: '#2563eb', border: '1px solid #2563eb', borderRadius: '6px', fontWeight: '500' }}>My Registrations</button>
          </Link>
        </div>

        <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Recent Registrations</h2>
        {registrations.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#64748b' }}>No registrations yet. Browse events to get started!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {registrations.slice(0, 3).map((reg) => (
              <div key={reg.registration_id} style={{ padding: '1.25rem', border: '1px solid #e2e8f0', borderRadius: '12px', backgroundColor: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 0.75rem 0', color: '#1e293b' }}>{reg.event_name}</h3>
                <p style={{ margin: '0.25rem 0', color: '#64748b', fontSize: '0.9rem' }}><strong>Date:</strong> {new Date(reg.event_date).toLocaleDateString()}</p>
                <p style={{ margin: '0.25rem 0', color: '#64748b', fontSize: '0.9rem' }}><strong>Time:</strong> {reg.event_time}</p>
                <p style={{ margin: '0.25rem 0', color: '#64748b', fontSize: '0.9rem' }}><strong>Venue:</strong> {reg.venue}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
