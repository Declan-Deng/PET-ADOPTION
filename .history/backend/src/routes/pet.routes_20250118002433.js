const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require("../middleware/auth.middleware");
const {
  createPet,
  getPets,
  getPetById,
  updatePet,
  deletePet,
  getNearbyPets,
  addToFavorites,
  removeFromFavorites,
} = require("../controllers/pet.controller");

// 获取宠物列表
router.get("/", getPets);

// 获取附近的宠物
router.get("/nearby", getNearbyPets);

// 获取单个宠物
router.get("/:id", getPetById);

// 需要认证的路由
router.use(auth);

// 创建宠物
router.post("/", createPet);

// 更新宠物
router.put("/:id", updatePet);

// 删除宠物
router.delete("/:id", deletePet);

// 收藏相关
router.post("/:id/favorite", addToFavorites);
router.delete("/:id/favorite", removeFromFavorites);

module.exports = router;
