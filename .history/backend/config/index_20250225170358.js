require("dotenv").config();

const config = {
  // 数据库配置
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/pet-adoption",
  },

  // 服务器配置
  server: {
    port: process.env.PORT || 5001,
    host: process.env.HOST || "localhost",
    url:
      process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5001}`,
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || "your-secret-key",
    expiresIn: "7d",
  },

  // 环境配置
  env: process.env.NODE_ENV || "development",

  // 文件上传配置
  upload: {
    path: process.env.UPLOAD_PATH || "uploads",
    url: process.env.UPLOAD_URL || `${process.env.SERVER_URL}/uploads`,
  },
};

module.exports = config;
