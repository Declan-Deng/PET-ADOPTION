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

// 上传头像
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "请选择要上传的文件" });
    }

    // 构建完整的URL
    const avatarUrl = `http://192.168.3.74:5001/uploads/${req.file.filename}`;

    // 更新用户头像
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "用户不存在" });
    }

    // 如果用户之前有头像，删除旧文件
    if (user.profile?.avatar) {
      const oldAvatarPath = path.join(
        __dirname,
        "../../uploads",
        path.basename(user.profile.avatar)
      );
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // 更新用户资料
    user.profile = user.profile || {};
    user.profile.avatar = avatarUrl;
    await user.save();

    res.json({
      message: "头像上传成功",
      url: avatarUrl,
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

    // 构建完整的URL
    const imageUrl = `http://192.168.3.74:5001/uploads/${req.file.filename}`;

    // 验证文件是否成功保存
    const filePath = path.join(__dirname, "../../uploads", req.file.filename);
    if (!fs.existsSync(filePath)) {
      throw new Error("文件保存失败");
    }

    console.log("图片已保存到:", filePath);
    console.log("可访问的URL:", imageUrl);

    res.json({
      message: "图片上传成功",
      url: imageUrl,
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
