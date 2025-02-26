import { request } from '@umijs/max';

export interface User {
  _id: string;
  username: string;
  email: string;
  profile: {
    name: string;
    phone: string;
    address: string;
  };
  role: 'user' | 'admin';
  status: 'active' | 'disabled';
  createdAt: string;
}

export async function getAllUsers() {
  return request<User[]>('/api/users', {
    method: 'GET',
  });
}

export async function updateUserStatus(
  id: string,
  status: 'active' | 'disabled',
) {
  return request<void>(`/api/users/${id}/status`, {
    method: 'PUT',
    data: { status },
  });
}
