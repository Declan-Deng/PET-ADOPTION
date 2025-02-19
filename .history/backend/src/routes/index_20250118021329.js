const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.routes");
const petRoutes = require("./pet.routes");
const adoptionRoutes = require("./adoption.routes");

router.use("/auth", authRoutes);
router.use("/pets", petRoutes);
router.use("/adoptions", adoptionRoutes);

module.exports = router;
