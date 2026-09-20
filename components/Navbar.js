import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function Navbar({ user }) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const toggleMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link href="/">Event Management System</Link>
      </div>
      
      <div className="hamburger" onClick={toggleMenu} style={{ cursor: 'pointer', display: 'none' /* Handled in CSS */ }}>
        ☰
      </div>

      <div className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
        {user.role === 'USER' && (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/events">Events</Link>
            <Link href="/registrations">My Registrations</Link>
          </>
        )}
        {user.role === 'ADMIN' && (
          <>
            <Link href="/admin/dashboard">Dashboard</Link>
            <Link href="/admin/add-event">Add Event</Link>
          </>
        )}
      </div>

      <div className="nav-right">
        <span>Welcome, {user.name}</span>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
      
      <style jsx>{`
        .navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 2rem;
          background-color: #333;
          color: white;
        }
        .nav-brand a {
          color: white;
          text-decoration: none;
          font-weight: bold;
          font-size: 1.2rem;
        }
        .nav-links a {
          color: white;
          text-decoration: none;
          margin: 0 1rem;
        }
        .nav-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .logout-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          cursor: pointer;
          border-radius: 4px;
        }
        @media (max-width: 768px) {
          .nav-links {
            display: none;
          }
          .nav-links.open {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 60px;
            left: 0;
            right: 0;
            background: #333;
            padding: 1rem;
          }
          .hamburger {
            display: block !important;
          }
        }
      `}</style>
    </nav>
  );
}
