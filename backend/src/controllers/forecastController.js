const { pool } = require("../config/db");

const getForecast = async (req, res) => {
  try {
    const { city = "Delhi", hours = 24 } = req.query;

    const result = await pool.query(
      `
      SELECT 
        m.value,
        m.measured_at
      FROM measurements m
      JOIN locations l ON m.location_id = l.id
      JOIN pollutants p ON m.pollutant_id = p.id
      WHERE LOWER(l.city) = LOWER($1)
      AND UPPER(p.code) = 'AQI'
      ORDER BY m.measured_at DESC
      LIMIT 24
      `,
      [city],
    );

    const historical = result.rows.reverse();

    if (historical.length === 0) {
      return res.json({
        success: true,
        message: "No historical AQI data available for forecasting",
        data: [],
      });
    }

    const values = historical.map((row) => Number(row.value));
    const forecast = [];
    const forecastHours = Number(hours);

    let movingValues = [...values];

    for (let i = 1; i <= forecastHours; i++) {
      const recentValues = movingValues.slice(-6);
      const predictedValue =
        recentValues.reduce((sum, value) => sum + value, 0) /
        recentValues.length;

      const lastTime = new Date(
        forecast.length === 0
          ? historical[historical.length - 1].measured_at
          : forecast[forecast.length - 1].predicted_at,
      );

      const nextTime = new Date(lastTime.getTime() + 60 * 60 * 1000);

      forecast.push({
        predicted_at: nextTime,
        predicted_aqi: Number(predictedValue.toFixed(2)),
        method: "Moving Average",
      });

      movingValues.push(predictedValue);
    }

    res.json({
      success: true,
      city,
      data: forecast,
    });
  } catch (error) {
    console.error("Forecast error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to generate forecast",
    });
  }
};

module.exports = {
  getForecast,
};
