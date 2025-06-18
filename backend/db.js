// db.js
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root4444',
  database: 'bookreview'
});

db.connect((err) => {
  if (err) {
    console.error('[DB] Bağlantı hatası:', err.message);
    return;
  }
  console.log('[DB] MySQL bağlantısı başarılı!');
});

module.exports = db;
