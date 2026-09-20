import pool from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    try {
      const [rows] = await pool.query(
        'SELECT r.registration_id, r.registration_date, e.event_id, e.event_name, e.event_date, e.event_time, e.venue FROM registrations r JOIN events e ON r.event_id = e.event_id WHERE r.user_id = ? ORDER BY e.event_date',
        [user_id]
      );
      return res.status(200).json(rows);
    } catch (error) {
      console.error('Fetch registrations error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  } else if (req.method === 'POST') {
    const { user_id, event_id } = req.body;
    if (!user_id || !event_id) {
      return res.status(400).json({ message: 'User ID and Event ID are required' });
    }
    try {
      await pool.query(
        'INSERT INTO registrations (user_id, event_id, registration_date) VALUES (?, ?, CURDATE())',
        [user_id, event_id]
      );
      return res.status(201).json({ message: 'Registered successfully' });
    } catch (error) {
      console.error('Create registration error:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Already registered' });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
