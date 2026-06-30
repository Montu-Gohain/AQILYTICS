const { pool } = require("../config/db");

const getPollutants = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, code, name, unit, description
      FROM pollutants
      ORDER BY id ASC
    `);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get pollutants error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pollutants",
    });
  }
};

module.exports = {
  getPollutants,
};
