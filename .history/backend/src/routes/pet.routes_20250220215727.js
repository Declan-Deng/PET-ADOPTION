const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
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
router.delete("/:id", protect, deletePet);
router.post("/:id/cancel", protect, cancelPublication);

module.exports = router;
