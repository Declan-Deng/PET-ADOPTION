require("dotenv").config();

// 构建服务器URL
const buildServerUrl = () => {
  if (process.env.SERVER_URL) {
    return process.env.SERVER_URL;
  }
  const host = process.env.HOST || "localhost";
  const port = process.env.PORT || 5001;
  return `http://${host}:${port}`;
};

// 构建上传URL
const buildUploadUrl = (serverUrl) => {
  if (process.env.UPLOAD_URL) {
    return process.env.UPLOAD_URL;
  }
  return `${serverUrl}/uploads`;
};

const serverUrl = buildServerUrl();

const config = {
  // 数据库配置
  mongodb: {
    uri: process.env.MONGODB_URI || "mongodb://localhost:27017/pet-adoption",
  },

  // 服务器配置
  server: {
    port: parseInt(process.env.PORT || "5001"),
    host: process.env.HOST || "localhost",
    url: serverUrl,
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
    url: buildUploadUrl(serverUrl),
  },
};

// 验证URL格式
try {
  new URL(config.server.url);
  new URL(config.upload.url);
} catch (error) {
  console.error("配置中的URL格式无效:", error);
  process.exit(1);
}

module.exports = config;
