const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  createPet,
  getPets,
  getPetById,
  updatePet,
  deletePet,
} = require("../controllers/pet.controller");

// 公开路由
router.get("/", getPets);
router.get("/:id", getPetById);

// 需要登录的路由
router.post("/", protect, createPet);
router.put("/:id", protect, updatePet);
router.delete("/:id", protect, deletePet);

module.exports = router;
