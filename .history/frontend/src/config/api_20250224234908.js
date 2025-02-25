// API配置
const DEV_API_URL = "http://10.0.2.2:5001"; // Android模拟器
const PROD_API_URL = ""; // 生产环境URL，待配置

// 根据环境选择API地址
export const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

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
  const { timeout = FETCH_CONFIG.timeout } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
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

  return headers;
};

// 带重试的请求函数
export const fetchWithRetry = async (url, options = {}) => {
  const { retries = FETCH_CONFIG.retries } = options;
  let lastError;

  for (let i = 0; i <= retries; i++) {
    try {
      return await fetchWithTimeout(url, options);
    } catch (error) {
      console.log(`请求失败，第 ${i + 1} 次重试...`);
      lastError = error;
      if (i < retries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }

  throw lastError;
};

// 处理图片URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return "https://via.placeholder.com/300x200?text=No+Image";

  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  if (imagePath.startsWith("file://")) {
    return "https://via.placeholder.com/300x200?text=No+Image";
  }

  return `${API_URL}${imagePath}`;
};
