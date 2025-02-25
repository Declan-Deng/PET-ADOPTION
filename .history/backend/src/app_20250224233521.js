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

// CORS配置
app.use(
  cors({
    origin: true, // 允许所有来源
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务配置
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"), {
    setHeaders: (res, path, stat) => {
      res.set("Access-Control-Allow-Origin", "*");
      res.set("Access-Control-Allow-Methods", "GET");
      res.set("Access-Control-Allow-Headers", "Content-Type");
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
    const PORT = process.env.PORT || 5001;
    const HOST = "0.0.0.0"; // 监听所有网络接口
    app.listen(PORT, HOST, () => {
      console.log(`服务器运行在 http://${HOST}:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("数据库连接失败:", err);
    process.exit(1);
  });

module.exports = app;
