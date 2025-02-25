const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const config = require("./config");

const app = express();

// 中间件配置
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, config.upload.path)));

// 连接数据库
mongoose
  .connect(config.mongodb.uri)
  .then(() => console.log("MongoDB连接成功"))
  .catch((err) => console.error("MongoDB连接失败:", err));

// 路由配置
app.use("/api/auth", require("./routes/auth"));
app.use("/api/pets", require("./routes/pets"));
app.use("/api/adoptions", require("./routes/adoptions"));
app.use("/api/upload", require("./routes/upload"));

// 启动服务器
app.listen(config.server.port, config.server.host, () => {
  console.log(`服务器运行在 ${config.server.url}`);
});
