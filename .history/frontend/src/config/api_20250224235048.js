// API配置
const DEV_API_URL = "http://10.0.2.2:5001"; // Android模拟器
const PROD_API_URL = ""; // 生产环境URL，待配置

// 根据环境选择API地址
export const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

console.log("当前API地址:", API_URL); // 添加调试日志

// API端点
export const ENDPOINTS = {
  PETS: "/api/pets",
  AUTH: "/api/auth",
  USERS: "/api/users",
  ADOPTIONS: "/api/adoptions",
  UPLOADS: "/uploads",
};

// 网络请求配置
export const FETCH_CONFIG = {
  timeout: 30000, // 30秒超时
  retries: 2, // 重试次数
};

// 带超时的fetch
export const fetchWithTimeout = async (url, options = {}) => {
  console.log("发起请求:", url); // 添加请求URL日志
  const { timeout = FETCH_CONFIG.timeout } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    console.log("请求超时:", url); // 添加超时日志
  }, timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    console.log("请求成功:", url, response.status); // 添加响应状态日志
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("请求失败:", url, error); // 添加错误日志
    throw error;
  }
};

// 获取API请求头
export const getApiHeaders = (token = null) => {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  console.log("请求头:", headers); // 添加请求头日志
  return headers;
};

// 带重试的请求函数
export const fetchWithRetry = async (url, options = {}) => {
  const { retries = FETCH_CONFIG.retries } = options;
  let lastError;

  for (let i = 0; i <= retries; i++) {
    try {
      console.log(`尝试请求 ${url} (第 ${i + 1} 次)`); // 添加重试日志
      return await fetchWithTimeout(url, options);
    } catch (error) {
      console.log(`请求失败，第 ${i + 1} 次重试...`);
      lastError = error;
      if (i < retries) {
        const delay = 1000 * (i + 1);
        console.log(`等待 ${delay}ms 后重试`); // 添加延迟日志
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

// 处理图片URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) {
    console.log("未提供图片路径，使用默认图片");
    return "https://via.placeholder.com/300x200?text=No+Image";
  }

  if (imagePath.startsWith("http")) {
    console.log("使用完整URL:", imagePath);
    return imagePath;
  }

  if (imagePath.startsWith("file://")) {
    console.log("本地文件路径，使用默认图片:", imagePath);
    return "https://via.placeholder.com/300x200?text=No+Image";
  }

  const fullUrl = `${API_URL}${imagePath}`;
  console.log("构建完整URL:", fullUrl);
  return fullUrl;
};
