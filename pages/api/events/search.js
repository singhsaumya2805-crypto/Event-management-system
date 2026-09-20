import pool from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    const searchQuery = `%${q}%`;
    const [rows] = await pool.query(
      'SELECT * FROM events WHERE event_name LIKE ? OR description LIKE ? OR venue LIKE ?',
      [searchQuery, searchQuery, searchQuery]
    );
    return res.status(200).json(rows);
  } catch (error) {
    console.error('Search events error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
