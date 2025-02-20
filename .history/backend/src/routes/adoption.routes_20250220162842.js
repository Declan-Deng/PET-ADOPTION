const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  createAdoption,
  getUserAdoptions,
  getPetAdoptions,
  getAdoptionById,
  cancelAdoption,
  approveAdoption,
} = require("../controllers/adoption.controller");

// 公开路由
router.get("/", protect, getUserAdoptions);
router.get("/pet/:petId", protect, getPetAdoptions);
router.get("/:id", protect, getAdoptionById);

// 需要登录的路由
router.post("/", protect, createAdoption);
router.delete("/:id", protect, cancelAdoption);
router.put("/:id/approve", protect, approveAdoption);

module.exports = router;
