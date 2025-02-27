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
  deleteAdoption,
} = require("../controllers/adoption.controller");

// 管理员路由
router.get("/all", protect, adminAuth, getAllAdoptions);
router.put("/:id/approve", protect, adminAuth, approveAdoption);
router.delete("/:id", protect, adminAuth, deleteAdoption);

// 用户路由
router.get("/", protect, getUserAdoptions);
router.get("/pet/:petId", protect, getPetAdoptions);
router.get("/:id", protect, getAdoptionById);
router.post("/", protect, createAdoption);
router.post("/:id/cancel", protect, cancelAdoption);

module.exports = router;
