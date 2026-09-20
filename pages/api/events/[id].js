import pool from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Event ID is required' });
  }

  try {
    // Delete registrations first due to foreign key constraints (if not using CASCADE)
    await pool.query('DELETE FROM registrations WHERE event_id = ?', [id]);
    await pool.query('DELETE FROM events WHERE event_id = ?', [id]);
    return res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
