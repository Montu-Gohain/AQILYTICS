const express = require("express");
const { getKPIs } = require("../controllers/kpiController");

const router = express.Router();

router.get("/", getKPIs);

module.exports = router;
