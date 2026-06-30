const express = require("express");
const { getPollutants } = require("../controllers/pollutantController");

const router = express.Router();

router.get("/", getPollutants);

module.exports = router;
