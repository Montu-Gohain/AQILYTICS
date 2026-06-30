require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
});

const connectDB = async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("PostgreSQL database connected successfully");
    console.log("Database time:", result.rows[0].now);
  } catch (error) {
    console.error("PostgreSQL database connection failed");
    console.error(error.message);
    process.exit(1);
  }
};

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL error:", err);
  process.exit(-1);
});

module.exports = {
  pool,
  connectDB,
};
