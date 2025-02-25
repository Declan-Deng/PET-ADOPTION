// API配置
const DEV_API_URL = "http://10.0.2.2:5001"; // Android模拟器专用
const PROD_API_URL = ""; // 生产环境使用相对路径

export const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

export const ENDPOINTS = {
  PETS: `${API_URL}/api/pets`,
  AUTH: `${API_URL}/api/auth`,
  USERS: `${API_URL}/api/users`,
  ADOPTIONS: `${API_URL}/api/adoptions`,
  UPLOADS: `${API_URL}/uploads`,
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

// 获取请求头
export const getApiHeaders = (token) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

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
