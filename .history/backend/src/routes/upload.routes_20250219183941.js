const express = require("express");
const router = express.Router();
const { upload, uploadAvatar } = require("../controllers/upload.controller");
const { protect } = require("../middleware/auth.middleware");

// 上传头像
router.post("/avatar", protect, upload.single("avatar"), uploadAvatar);

module.exports = router;
