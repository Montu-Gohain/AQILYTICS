const { pool } = require("../config/db");

const getMeasurements = async (req, res) => {
  try {
    const { city, pollutant, start, end, limit = 500 } = req.query;

    const conditions = [];
    const values = [];

    if (city) {
      values.push(city);
      conditions.push(`LOWER(l.city) = LOWER($${values.length})`);
    }

    if (pollutant) {
      values.push(pollutant);
      conditions.push(`UPPER(p.code) = UPPER($${values.length})`);
    }

    if (start) {
      values.push(start);
      conditions.push(`m.measured_at >= $${values.length}`);
    }

    if (end) {
      values.push(end);
      conditions.push(`m.measured_at <= $${values.length}`);
    }

    values.push(Number(limit));
    const limitIndex = values.length;

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT 
        m.id,
        l.city,
        l.state,
        p.code AS pollutant_code,
        p.name AS pollutant_name,
        m.value,
        p.unit,
        m.measured_at,
        m.source
      FROM measurements m
      JOIN locations l ON m.location_id = l.id
      JOIN pollutants p ON m.pollutant_id = p.id
      ${whereClause}
      ORDER BY m.measured_at DESC
      LIMIT $${limitIndex}
    `;

    const result = await pool.query(query, values);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get measurements error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch measurements",
    });
  }
};

module.exports = {
  getMeasurements,
};
