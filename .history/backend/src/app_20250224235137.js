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

// 增加请求超时设置
app.use((req, res, next) => {
  // 设置响应超时时间为 30 秒
  res.setTimeout(30000, () => {
    console.log("请求超时");
    res.status(408).send("请求超时");
  });
  next();
});

// CORS配置
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// 增加请求体大小限制
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// 静态文件服务配置
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), {
    setHeaders: (res) => {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Cache-Control", "no-cache");
    },
  })
);

// 路由
app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/adoptions", adoptionRoutes);
app.use("/api/upload", uploadRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error("服务器错误:", err);
  res.status(500).json({
    success: false,
    message: "服务器错误",
    error: err.message,
  });
});

// 数据库连接
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => {
    console.log("数据库连接成功");
    const PORT = process.env.PORT || 5001;
    const HOST = "localhost"; // 修改为localhost
    app.listen(PORT, HOST, () => {
      console.log(`服务器运行在 http://${HOST}:${PORT}`);
      console.log(`API地址: http://${HOST}:${PORT}/api`);
      console.log("Android模拟器可以通过 http://10.0.2.2:5001 访问");
    });
  })
  .catch((err) => {
    console.error("数据库连接失败:", err);
    process.exit(1);
  });

module.exports = app;
