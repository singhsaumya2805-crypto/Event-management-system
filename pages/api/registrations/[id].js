import pool from '@/lib/db';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Registration ID is required' });
  }

  try {
    await pool.query('DELETE FROM registrations WHERE registration_id = ?', [id]);
    return res.status(200).json({ message: 'Registration deleted successfully' });
  } catch (error) {
    console.error('Delete registration error:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
