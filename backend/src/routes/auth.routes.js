const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const {
  register,
  login,
  getCurrentUser,
  updateProfile,
} = require("../controllers/auth.controller");

// 注册
router.post("/register", register);

// 登录
router.post("/login", login);

// 获取当前用户信息
router.get("/me", protect, getCurrentUser);

// 更新用户信息
router.put("/profile", protect, updateProfile);

module.exports = router;
