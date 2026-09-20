import pool from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Event ID is required' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT u.user_id, u.name, u.email, r.registration_date FROM registrations r JOIN users u ON r.user_id = u.user_id WHERE r.event_id = ? ORDER BY r.registration_date',
      [id]
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Fetch event participants error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
