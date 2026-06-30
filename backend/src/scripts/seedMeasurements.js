require("dotenv").config();

const { pool } = require("../config/db");

const getRandomNumber = (min, max) => {
  return Number((Math.random() * (max - min) + min).toFixed(2));
};

const getAQIBaseByCity = (city) => {
  const cityBaseAQI = {
    Delhi: 240,
    Mumbai: 120,
    Bengaluru: 80,
    Guwahati: 95,
    Kolkata: 160,
  };

  return cityBaseAQI[city] || 100;
};

const generatePollutantValue = (pollutantCode, city, hour) => {
  const peakHourBoost =
    hour >= 7 && hour <= 10 ? 35 : hour >= 18 && hour <= 21 ? 45 : 0;

  switch (pollutantCode) {
    case "AQI":
      return Math.max(
        20,
        getAQIBaseByCity(city) + peakHourBoost + getRandomNumber(-45, 45),
      );

    case "PM2.5":
      return Math.max(
        5,
        getAQIBaseByCity(city) * 0.45 + getRandomNumber(-15, 20),
      );

    case "PM10":
      return Math.max(
        10,
        getAQIBaseByCity(city) * 0.75 + getRandomNumber(-20, 30),
      );

    case "CO":
      return getRandomNumber(0.4, 3.5);

    case "NO2":
      return getRandomNumber(10, 90);

    case "SO2":
      return getRandomNumber(5, 50);

    case "O3":
      return getRandomNumber(10, 120);

    case "TEMP":
      return getRandomNumber(18, 38);

    case "HUMIDITY":
      return getRandomNumber(35, 90);

    default:
      return getRandomNumber(10, 100);
  }
};

const seedMeasurements = async () => {
  try {
    console.log("Starting measurement seed...");

    const locationsResult = await pool.query("SELECT id, city FROM locations");
    const pollutantsResult = await pool.query(
      "SELECT id, code FROM pollutants",
    );

    const locations = locationsResult.rows;
    const pollutants = pollutantsResult.rows;

    if (locations.length === 0 || pollutants.length === 0) {
      console.log("No locations or pollutants found. Run schema.sql first.");
      process.exit(1);
    }

    const now = new Date();
    let insertedCount = 0;

    for (const location of locations) {
      for (let day = 0; day < 14; day++) {
        for (let hour = 0; hour < 24; hour++) {
          const measuredAt = new Date(now);
          measuredAt.setDate(now.getDate() - day);
          measuredAt.setHours(hour, 0, 0, 0);

          for (const pollutant of pollutants) {
            const value = generatePollutantValue(
              pollutant.code,
              location.city,
              hour,
            );

            await pool.query(
              `
              INSERT INTO measurements 
              (location_id, pollutant_id, value, measured_at, source)
              VALUES ($1, $2, $3, $4, $5)
              ON CONFLICT (location_id, pollutant_id, measured_at)
              DO NOTHING
              `,
              [
                location.id,
                pollutant.id,
                value,
                measuredAt,
                "Simulated IoT Sensor Data",
              ],
            );

            insertedCount++;
          }
        }
      }
    }

    await pool.query("DELETE FROM alerts");

    await pool.query(`
      INSERT INTO alerts 
      (location_id, measurement_id, alert_type, severity, message, created_at)
      SELECT 
        m.location_id,
        m.id,
        'AQI Hazard',
        CASE 
          WHEN m.value > 300 THEN 'Hazardous'
          WHEN m.value > 200 THEN 'Very Poor'
          ELSE 'Moderate'
        END,
        CONCAT('High AQI detected in ', l.city, ': ', m.value),
        m.measured_at
      FROM measurements m
      JOIN pollutants p ON m.pollutant_id = p.id
      JOIN locations l ON m.location_id = l.id
      WHERE UPPER(p.code) = 'AQI'
      AND m.value > 200
    `);

    console.log("Measurement seed completed.");
    console.log(`Processed records: ${insertedCount}`);

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
};

seedMeasurements();
