const express = require("express");
const router = express.Router();
const {
  upload,
  uploadAvatar,
  uploadImage,
} = require("../controllers/upload.controller");
const { protect } = require("../middleware/auth.middleware");
const multer = require("multer");

// 配置 multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const uploadMulter = multer({ storage: storage });

// 上传头像
router.post("/avatar", protect, uploadMulter.single("avatar"), uploadAvatar);

// 宠物图片上传
router.post("/image", protect, uploadMulter.single("image"), uploadImage);

module.exports = router;
