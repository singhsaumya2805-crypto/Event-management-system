require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function checkDb() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    console.log("✅ Connected to MySQL successfully.");

    // Check database
    const [dbs] = await connection.query("SHOW DATABASES LIKE 'event_management'");
    if (dbs.length === 0) {
      console.log("Database 'event_management' does NOT exist. Creating it...");
      await connection.query("CREATE DATABASE event_management");
      console.log("✅ Database 'event_management' created.");
    } else {
      console.log("✅ Database 'event_management' exists.");
    }
    await connection.query("USE event_management");

    // Check users table
    const [userTables] = await connection.query("SHOW TABLES LIKE 'users'");
    if (userTables.length === 0) {
      console.log("Table 'users' does NOT exist. Creating it...");
      await connection.query(`
        CREATE TABLE users (
          user_id INT PRIMARY KEY AUTO_INCREMENT,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(100) NOT NULL,
          role VARCHAR(20) DEFAULT 'USER'
        )
      `);
      console.log("✅ Table 'users' created.");
    } else {
      console.log("✅ Table 'users' exists.");
    }

    // Check events table
    const [eventsTables] = await connection.query("SHOW TABLES LIKE 'events'");
    if (eventsTables.length === 0) {
      console.log("Table 'events' does NOT exist. Creating it...");
      await connection.query(`
        CREATE TABLE events (
          event_id INT PRIMARY KEY AUTO_INCREMENT,
          event_name VARCHAR(150) NOT NULL,
          description TEXT,
          event_date DATE NOT NULL,
          event_time TIME NOT NULL,
          venue VARCHAR(150) NOT NULL,
          capacity INT NOT NULL
        )
      `);
      console.log("✅ Table 'events' created.");
    }

    // Check registrations table
    const [regTables] = await connection.query("SHOW TABLES LIKE 'registrations'");
    if (regTables.length === 0) {
      console.log("Table 'registrations' does NOT exist. Creating it...");
      await connection.query(`
        CREATE TABLE registrations (
          registration_id INT PRIMARY KEY AUTO_INCREMENT,
          user_id INT NOT NULL,
          event_id INT NOT NULL,
          registration_date DATE NOT NULL,
          FOREIGN KEY (user_id) REFERENCES users(user_id),
          FOREIGN KEY (event_id) REFERENCES events(event_id),
          UNIQUE(user_id, event_id)
        )
      `);
      console.log("✅ Table 'registrations' created.");
    }

    // Check admin user
    const [users] = await connection.query("SELECT * FROM users WHERE email = 'admin@event.com'");
    if (users.length === 0) {
      console.log("User 'admin@event.com' does NOT exist. Creating...");
      await connection.query("INSERT INTO users (name, email, password, role) VALUES ('Admin', 'admin@event.com', 'admin123', 'ADMIN')");
      console.log("✅ Admin user created.");
    } else {
      console.log("✅ User 'admin@event.com' exists.");
      // Ensure password is correct
      if (users[0].password !== 'admin123') {
          console.log("Updating admin password to admin123...");
          await connection.query("UPDATE users SET password = 'admin123' WHERE email = 'admin@event.com'");
          console.log("✅ Admin password updated.");
      }
    }

    console.log("🎉 Database verification complete.");
    await connection.end();
  } catch (err) {
    console.error("❌ DB Error:", err.message);
  }
}
checkDb();
