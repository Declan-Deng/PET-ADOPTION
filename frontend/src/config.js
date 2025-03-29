// API配置
export const API_BASE_URL = "http://192.168.31.232:5001";

// API端点
export const API_ENDPOINTS = {
  // 认证相关
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  PROFILE: `${API_BASE_URL}/api/auth/profile`,
  ME: `${API_BASE_URL}/api/auth/me`,

  // 宠物相关
  PETS: `${API_BASE_URL}/api/pets`,
  PET_DETAIL: (id) => `${API_BASE_URL}/api/pets/${id}`,
  CANCEL_PET: (id) => `${API_BASE_URL}/api/pets/${id}/cancel`,

  // 领养相关
  ADOPTIONS: `${API_BASE_URL}/api/adoptions`,
  PET_ADOPTIONS: (petId) => `${API_BASE_URL}/api/adoptions/pet/${petId}`,
  APPROVE_ADOPTION: (id) => `${API_BASE_URL}/api/adoptions/${id}/approve`,
  REJECT_ADOPTION: (id) => `${API_BASE_URL}/api/adoptions/${id}/reject`,
  CANCEL_ADOPTION: (id) => `${API_BASE_URL}/api/adoptions/${id}`,

  // 上传相关
  UPLOAD_IMAGE: `${API_BASE_URL}/api/upload/image`,
  UPLOAD_AVATAR: `${API_BASE_URL}/api/upload/avatar`,
};

// 静态资源URL
export const STATIC_URLS = {
  UPLOADS: `${API_BASE_URL}/uploads`,
  AVATARS: `${API_BASE_URL}/uploads/avatars`,
};
