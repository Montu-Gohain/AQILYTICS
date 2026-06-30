require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { pool, connectDB } = require("./config/db");

const cityRoutes = require("./routes/cityRoutes");
const pollutantRoutes = require("./routes/pollutantRoutes");
const measurementRoutes = require("./routes/measurementRoutes");
const kpiRoutes = require("./routes/kpiRoutes");
const forecastRoutes = require("./routes/forecastRoutes");
const alertRoutes = require("./routes/alertRoutes");

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Air Quality Monitoring API is running",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.status(200).json({
      status: "ok",
      database: "connected",
      time: result.rows[0].now,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      message: error.message,
    });
  }
});

app.use("/api/cities", cityRoutes);
app.use("/api/pollutants", pollutantRoutes);
app.use("/api/measurements", measurementRoutes);
app.use("/api/kpis", kpiRoutes);
app.use("/api/forecast", forecastRoutes);
app.use("/api/alerts", alertRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

const PORT = process.env.PORT || 5050;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
};

startServer();
