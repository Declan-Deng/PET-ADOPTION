const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/user.model");
const crypto = require("crypto");

// 从环境变量获取服务器地址
const SERVER_URL = process.env.SERVER_URL || "http://localhost:5001";

// 生成唯一的文件名
const generateUniqueFilename = (originalname) => {
  const timestamp = Date.now();
  const hash = crypto
    .createHash("md5")
    .update(originalname + timestamp)
    .digest("hex");
  const ext = path.extname(originalname);
  return `${timestamp}-${hash}${ext}`;
};

// 确保上传目录存在
const ensureUploadDirExists = () => {
  const uploadDir = path.join(__dirname, "../../uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

// 配置存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = ensureUploadDirExists();
    console.log("文件将保存到:", uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const filename = generateUniqueFilename(file.originalname);
    console.log("生成的文件名:", filename);
    cb(null, filename);
  },
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
  console.log("检查文件类型:", file.mimetype);
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

// 构建图片URL的辅助函数
const buildImageUrl = (filename) => {
  // 确保使用环境变量中的服务器URL
  const serverUrl = process.env.SERVER_URL || "http://192.168.3.74:5001";
  const url = `${serverUrl}/uploads/${filename}`;
  console.log("构建的图片URL:", url);

  // 验证URL格式
  try {
    new URL(url);
  } catch (error) {
    console.error("生成的URL格式无效:", url);
    throw new Error("生成的图片URL格式无效");
  }

  return url;
};

// 验证文件是否成功保存
const verifyFileExists = (filePath) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`文件未能成功保存到: ${filePath}`);
  }
  const stats = fs.statSync(filePath);
  if (stats.size === 0) {
    throw new Error(`文件保存失败，文件大小为0: ${filePath}`);
  }
  console.log("文件已成功保存到:", filePath, "大小:", stats.size, "字节");
  return true;
};

// 上传头像
const uploadAvatar = async (req, res) => {
  try {
    console.log("开始处理头像上传...");
    if (!req.file) {
      return res.status(400).json({ message: "请选择要上传的文件" });
    }

    const filePath = path.join(__dirname, "../../uploads", req.file.filename);
    verifyFileExists(filePath);

    const avatarUrl = buildImageUrl(req.file.filename);
    console.log("头像URL:", avatarUrl);

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
        console.log("已删除旧头像:", oldAvatarPath);
      }
    }

    // 更新用户资料
    user.profile = user.profile || {};
    user.profile.avatar = avatarUrl;
    await user.save();
    console.log("用户头像已更新");

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
  let savedFilePath = null;
  try {
    console.log("开始处理宠物图片上传...");
    console.log("请求体:", req.body);
    console.log("上传的文件:", req.file);

    if (!req.file) {
      return res.status(400).json({ message: "请选择要上传的文件" });
    }

    savedFilePath = path.join(__dirname, "../../uploads", req.file.filename);
    verifyFileExists(savedFilePath);

    const imageUrl = buildImageUrl(req.file.filename);
    console.log("宠物图片URL:", imageUrl);

    // 测试图片是否可访问
    try {
      await fetch(imageUrl);
      console.log("图片URL可以正常访问");
    } catch (error) {
      console.error("图片URL访问测试失败:", error);
      throw new Error("图片URL无法访问，请检查服务器配置");
    }

    res.json({
      message: "图片上传成功",
      url: imageUrl,
    });
  } catch (error) {
    console.error("上传图片失败:", error);
    // 如果文件已保存但处理失败，删除文件
    if (savedFilePath && fs.existsSync(savedFilePath)) {
      try {
        fs.unlinkSync(savedFilePath);
        console.log("已删除失败的上传文件:", savedFilePath);
      } catch (e) {
        console.error("删除失败的文件时出错:", e);
      }
    }
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
