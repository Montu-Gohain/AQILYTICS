const { pool } = require("../config/db");

const getCities = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, city, state, country, latitude, longitude
      FROM locations
      ORDER BY city ASC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get cities error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cities",
    });
  }
};

module.exports = {
  getCities,
};
