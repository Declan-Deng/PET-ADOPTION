const express = require("express");
const router = express.Router();
const { protect, adminAuth } = require("../middleware/auth.middleware");
const {
  createPet,
  getPets,
  getPetById,
  updatePet,
  deletePet,
  getAllPets,
  cancelPublication,
} = require("../controllers/pet.controller");

// 公开路由
router.get("/", protect, getAllPets);
router.get("/:id", protect, getPetById);

// 需要登录的路由
router.post("/", protect, createPet);
router.put("/:id", protect, updatePet);

// 管理员路由
router.delete("/:id", protect, adminAuth, deletePet);

// 用户路由
router.post("/:id/cancel", protect, cancelPublication);

module.exports = router;
