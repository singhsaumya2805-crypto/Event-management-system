import pool from '@/lib/db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query('SELECT * FROM events ORDER BY event_date ASC');
      return res.status(200).json(rows);
    } catch (error) {
      console.error('Fetch events error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  } else if (req.method === 'POST') {
    const { event_name, description, event_date, event_time, venue, capacity } = req.body;

    if (!event_name || !event_date || !event_time || !venue || !capacity) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    try {
      await pool.query(
        'INSERT INTO events (event_name, description, event_date, event_time, venue, capacity) VALUES (?, ?, ?, ?, ?, ?)',
        [event_name, description, event_date, event_time, venue, capacity]
      );
      return res.status(201).json({ message: 'Event created successfully' });
    } catch (error) {
      console.error('Create event error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
