const { Pool } = require('pg');
require('dotenv').config();

const config = {
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 5432,
  ssl: {
    // Required for Azure PostgreSQL
    rejectUnauthorized: true
  },
  max: 10, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
};

// Store the connection pool globally to reuse it across requests
let pool = null;

/**
 * Get a database connection pool.
 *
 * This function implements connection pooling - instead of creating a new connection
 * for every database query, it reuses a single pool of connections. This is important because:
 *
 * 1. Performance: Creating new connections is slow and resource-intensive
 * 2. Scalability: Limits the number of concurrent connections to the database
 * 3. Cost: Azure PostgreSQL charges per connection, so reusing connections saves money
 *
 * The pool is created only once and reused for all subsequent requests.
 */
function getConnection() {
  if (!pool) {
    pool = new Pool(config);
    console.log('Connected to Azure PostgreSQL Database');
  }
  return pool;
}

/**
 * Get all greetings from the database, ordered by most recent first.
 */
async function getAllGreetings() {
  const pool = getConnection();
  const result = await pool.query('SELECT * FROM Greetings ORDER BY CreatedAt DESC');
  return result.rows;
}

/**
 * Create a new greeting in the database.
 * Returns the newly created greeting with its ID and timestamp.
 */
async function createGreeting(text) {
  const pool = getConnection();
  const result = await pool.query(
    'INSERT INTO Greetings (Text) VALUES ($1) RETURNING *',
    [text]
  );
  return result.rows[0];
}

module.exports = {
  getAllGreetings,
  createGreeting
};
