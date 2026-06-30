const express = require("express");
const { getMeasurements } = require("../controllers/measurementController");

const router = express.Router();

router.get("/", getMeasurements);

module.exports = router;
