const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./users.db", sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  }
});
// Create users table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        token TEXT,
        token_status INTEGER DEFAULT 0  
    )`);
  db.run(`CREATE TABLE IF NOT EXISTS user_macs (
      user_id INTEGER,
      mac TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);
});

module.exports = db;
