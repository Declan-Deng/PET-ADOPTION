const express = require("express");
const router = express.Router();
const { protect, adminAuth } = require("../middleware/auth.middleware");
const {
  getAllUsers,
  getUser,
  updateUserStatus,
} = require("../controllers/user.controller");

// 管理员路由
router.get("/", protect, adminAuth, getAllUsers);
router.get("/:id", protect, adminAuth, getUser);
router.put("/:id/status", protect, adminAuth, updateUserStatus);

module.exports = router;
