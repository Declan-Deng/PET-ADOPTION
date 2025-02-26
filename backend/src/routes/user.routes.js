const express = require("express");
const router = express.Router();
const User = require("../models/user.model");
const { protect, adminAuth } = require("../middleware/auth.middleware");

// 获取所有用户列表
router.get("/", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "没有管理员权限" });
    }
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (error) {
    console.error("获取用户列表失败:", error);
    res.status(500).json({ message: "获取用户列表失败" });
  }
});

// 获取单个用户信息
router.get("/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "没有管理员权限" });
    }
    const user = await User.findById(req.params.id, "-password");
    if (!user) {
      return res.status(404).json({ message: "用户不存在" });
    }
    res.json(user);
  } catch (error) {
    console.error("获取用户信息失败:", error);
    res.status(500).json({ message: "获取用户信息失败" });
  }
});

// 更新用户状态
router.put("/:id/status", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "没有管理员权限" });
    }
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, select: "-password" }
    );
    if (!user) {
      return res.status(404).json({ message: "用户不存在" });
    }
    res.json(user);
  } catch (error) {
    console.error("更新用户状态失败:", error);
    res.status(500).json({ message: "更新用户状态失败" });
  }
});

module.exports = router;
