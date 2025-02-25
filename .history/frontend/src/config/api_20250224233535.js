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

export const getApiHeaders = (token) => ({
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});
