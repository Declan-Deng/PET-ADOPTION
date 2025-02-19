const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 配置存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 使用绝对路径
    const uploadDir = path.join(__dirname, "../../uploads/avatars");
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
    console.log("开始处理头像上传请求");
    console.log("请求文件信息:", req.file);

    if (!req.file) {
      console.error("未接收到文件");
      return res.status(400).json({ message: "请选择要上传的图片" });
    }

    // 检查文件是否成功保存
    const filePath = path.join(
      __dirname,
      "../../uploads/avatars",
      req.file.filename
    );
    console.log("文件保存路径:", filePath);

    if (!fs.existsSync(filePath)) {
      console.error("文件未成功保存到服务器");
      return res.status(500).json({ message: "文件保存失败" });
    }

    // 构建完整的URL
    const fileUrl = `http://192.168.3.74:5001/uploads/avatars/${req.file.filename}`;
    console.log("生成的文件URL:", fileUrl);

    // 更新用户的头像信息
    if (req.user) {
      console.log("更新用户头像信息, 用户ID:", req.user._id);
      req.user.profile = req.user.profile || {};
      req.user.profile.avatar = fileUrl;
      await req.user.save();
      console.log("用户头像信息已更新");
    }

    // 验证文件是否可访问
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
      console.log("文件可以正常访问");
    } catch (error) {
      console.error("文件访问失败:", error);
    }

    res.json({
      message: "头像上传成功",
      url: fileUrl,
    });
  } catch (error) {
    console.error("头像上传失败:", error);
    res.status(500).json({ message: "头像上传失败", error: error.message });
  }
};

module.exports = {
  upload,
  uploadAvatar,
};
