const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'quizgame'
});

// You don't need to call db.connect() explicitly

// You can export the connection directly
module.exports = db;
