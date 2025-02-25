// API配置
export const API_URL = "http://192.168.31.232:5001";
export const SERVER_URL = "http://192.168.31.232:5001";

// API端点
export const ENDPOINTS = {
  // 认证相关
  LOGIN: `${API_URL}/api/auth/login`,
  REGISTER: `${API_URL}/api/auth/register`,
  PROFILE: `${API_URL}/api/auth/profile`,
  ME: `${API_URL}/api/auth/me`,

  // 宠物相关
  PETS: `${API_URL}/api/pets`,
  PET_DETAIL: (id) => `${API_URL}/api/pets/${id}`,
  CANCEL_PET: (id) => `${API_URL}/api/pets/${id}/cancel`,

  // 领养相关
  ADOPTIONS: `${API_URL}/api/adoptions`,
  ADOPTION_DETAIL: (id) => `${API_URL}/api/adoptions/${id}`,
  PET_ADOPTIONS: (petId) => `${API_URL}/api/adoptions/pet/${petId}`,
  APPROVE_ADOPTION: (id) => `${API_URL}/api/adoptions/${id}/approve`,

  // 上传相关
  UPLOAD_AVATAR: `${API_URL}/api/upload/avatar`,
  UPLOAD_IMAGE: `${API_URL}/api/upload/image`,

  // 静态资源
  UPLOADS: `${SERVER_URL}/uploads`,
};
