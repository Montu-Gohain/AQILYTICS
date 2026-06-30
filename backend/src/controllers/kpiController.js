const { pool } = require("../config/db");

const getKPIs = async (req, res) => {
  try {
    const { city, start, end } = req.query;

    const conditions = [`UPPER(p.code) = 'AQI'`];
    const values = [];

    if (city) {
      values.push(city);
      conditions.push(`LOWER(l.city) = LOWER($${values.length})`);
    }

    if (start) {
      values.push(start);
      conditions.push(`m.measured_at >= $${values.length}`);
    }

    if (end) {
      values.push(end);
      conditions.push(`m.measured_at <= $${values.length}`);
    }

    const query = `
      SELECT 
        l.city,
        m.value,
        m.measured_at
      FROM measurements m
      JOIN locations l ON m.location_id = l.id
      JOIN pollutants p ON m.pollutant_id = p.id
      WHERE ${conditions.join(" AND ")}
      ORDER BY m.measured_at ASC
    `;

    const result = await pool.query(query, values);
    const rows = result.rows;

    if (rows.length === 0) {
      return res.json({
        success: true,
        message: "No AQI data found for selected filters",
        data: {
          averageAQI: 0,
          peakAQI: 0,
          peakPollutionTime: null,
          safeDays: 0,
          hazardousDays: 0,
          totalRecords: 0,
        },
      });
    }

    const valuesOnly = rows.map((row) => Number(row.value));
    const averageAQI =
      valuesOnly.reduce((sum, value) => sum + value, 0) / valuesOnly.length;

    const peakRow = rows.reduce((max, row) =>
      Number(row.value) > Number(max.value) ? row : max,
    );

    const dailyMap = {};

    rows.forEach((row) => {
      const date = new Date(row.measured_at).toISOString().split("T")[0];

      if (!dailyMap[date]) {
        dailyMap[date] = [];
      }

      dailyMap[date].push(Number(row.value));
    });

    let safeDays = 0;
    let hazardousDays = 0;

    Object.values(dailyMap).forEach((dayValues) => {
      const dayAverage =
        dayValues.reduce((sum, value) => sum + value, 0) / dayValues.length;

      if (dayAverage <= 100) {
        safeDays++;
      }

      if (dayAverage > 300) {
        hazardousDays++;
      }
    });

    res.json({
      success: true,
      data: {
        averageAQI: Number(averageAQI.toFixed(2)),
        peakAQI: Number(peakRow.value),
        peakPollutionTime: peakRow.measured_at,
        safeDays,
        hazardousDays,
        totalRecords: rows.length,
      },
    });
  } catch (error) {
    console.error("Get KPIs error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch KPIs",
    });
  }
};

module.exports = {
  getKPIs,
};
