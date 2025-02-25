const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const petRoutes = require("./routes/pet.routes");
const adoptionRoutes = require("./routes/adoption.routes");
const uploadRoutes = require("./routes/upload.routes");

const app = express();

// 确保上传目录存在
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("创建上传目录:", uploadsDir);
}

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务配置
app.use("/uploads", (req, res, next) => {
  const filePath = path.join(__dirname, "../uploads", req.path);
  console.log("请求静态文件:", req.path);
  console.log("完整文件路径:", filePath);

  // 检查文件是否存在
  if (!fs.existsSync(filePath)) {
    console.error("文件不存在:", filePath);
    return res.status(404).send("文件不存在");
  }

  // 设置缓存控制头
  res.set({
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  });

  // 使用express.static处理文件
  express.static(path.join(__dirname, "../uploads"))(req, res, next);
});

// 路由
app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/adoptions", adoptionRoutes);
app.use("/api/upload", uploadRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error("服务器错误:", err);
  res.status(500).json({ message: "服务器错误", error: err.message });
});

// 数据库连接
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("数据库连接成功");
  })
  .catch((err) => {
    console.error("数据库连接失败:", err);
    process.exit(1);
  });

// 启动服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`服务器运行在端口 ${PORT}`);
  console.log(`静态文件服务地址: ${process.env.SERVER_URL}/uploads`);
});

module.exports = app;
