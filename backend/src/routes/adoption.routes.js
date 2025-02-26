const express = require("express");
const router = express.Router();
const { protect, adminAuth } = require("../middleware/auth.middleware");
const {
  createAdoption,
  getUserAdoptions,
  getPetAdoptions,
  getAdoptionById,
  cancelAdoption,
  approveAdoption,
  getAllAdoptions,
} = require("../controllers/adoption.controller");

// 管理员路由
router.get("/all", protect, adminAuth, getAllAdoptions);

// 用户路由
router.get("/", protect, getUserAdoptions);
router.get("/pet/:petId", protect, getPetAdoptions);
router.get("/:id", protect, getAdoptionById);
router.post("/", protect, createAdoption);
router.delete("/:id", protect, cancelAdoption);
router.put("/:id/approve", protect, approveAdoption);

module.exports = router;
