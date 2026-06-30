const { pool } = require("../config/db");

const getAlerts = async (req, res) => {
  try {
    const { city } = req.query;

    const values = [];
    let whereClause = "";

    if (city) {
      values.push(city);
      whereClause = `WHERE LOWER(l.city) = LOWER($1)`;
    }

    const result = await pool.query(
      `
      SELECT 
        a.id,
        l.city,
        a.alert_type,
        a.severity,
        a.message,
        a.created_at
      FROM alerts a
      JOIN locations l ON a.location_id = l.id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT 50
      `,
      values,
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get alerts error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch alerts",
    });
  }
};

module.exports = {
  getAlerts,
};
