const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/user.model");

// 配置存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 使用绝对路径
    const uploadDir = path.join(__dirname, "../../uploads");
    // 确保上传目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
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

// 生成完整的URL
const getFullUrl = (req, relativePath) => {
  return `http://192.168.3.74:5001${relativePath}`;
};

// 上传头像
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "请选择要上传的文件" });
    }

    const relativePath = `/uploads/${req.file.filename}`;
    const fullUrl = getFullUrl(req, relativePath);

    // 更新用户头像
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "用户不存在" });
    }

    // 如果用户之前有头像，删除旧文件
    if (user.profile?.avatar) {
      const oldPath = user.profile.avatar.replace(/^http.*?\/uploads\//, "");
      const oldAvatarPath = path.join(__dirname, "../../uploads", oldPath);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // 更新用户资料
    user.profile = user.profile || {};
    user.profile.avatar = fullUrl;
    await user.save();

    res.json({
      message: "头像上传成功",
      url: fullUrl,
    });
  } catch (error) {
    console.error("上传头像失败:", error);
    res.status(500).json({
      message: error.message || "上传头像失败",
    });
  }
};

// 上传宠物图片
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "请选择要上传的文件" });
    }

    const relativePath = `/uploads/${req.file.filename}`;
    const fullUrl = getFullUrl(req, relativePath);

    console.log("图片上传成功:", {
      filename: req.file.filename,
      relativePath,
      fullUrl,
    });

    res.json({
      message: "图片上传成功",
      url: fullUrl,
    });
  } catch (error) {
    console.error("上传图片失败:", error);
    res.status(500).json({
      message: error.message || "上传图片失败",
    });
  }
};

module.exports = {
  upload,
  uploadAvatar,
  uploadImage,
};
