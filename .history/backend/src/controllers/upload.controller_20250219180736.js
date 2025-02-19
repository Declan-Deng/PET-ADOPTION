const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 配置文件存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/avatars";
    // 确保上传目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
  },
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  // 只接受图片文件
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("只能上传图片文件！"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 限制5MB
  },
});

// 上传头像
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "请选择要上传的头像文件" });
    }

    // 生成可访问的URL
    const avatarUrl = `http://192.168.3.74:5001/uploads/avatars/${req.file.filename}`;

    res.json({
      message: "头像上传成功",
      avatarUrl: avatarUrl,
    });
  } catch (error) {
    console.error("上传头像失败:", error);
    res.status(500).json({
      message: "上传头像失败",
      error: error.message,
    });
  }
};

module.exports = {
  upload,
  uploadAvatar,
};
