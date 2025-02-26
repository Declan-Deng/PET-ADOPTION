// @ts-ignore
import { request } from '@umijs/max';

export interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: 'user' | 'admin';
    profile: {
      name: string;
      phone: string;
      email: string;
      address: string;
      avatar: string | null;
    };
  };
}

export async function login(params: LoginParams) {
  console.log('发送登录请求:', params);
  try {
    const response = await request<LoginResult>('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      data: params,
    });

    console.log('登录响应:', response);

    if (response.user.role !== 'admin') {
      throw new Error('非管理员用户无法登录');
    }

    // 保存token到localStorage
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));

    return response;
  } catch (error: any) {
    console.error('登录请求错误:', error);
    if (error.response) {
      throw new Error(error.response.data?.message || '登录失败，请重试');
    }
    throw error;
  }
}
