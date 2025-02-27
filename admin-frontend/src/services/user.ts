import { request } from '@umijs/max';

export interface User {
  _id: string;
  username: string;
  email: string;
  profile: {
    name: string;
    phone: string;
    address: string;
    avatar?: string;
  };
  role: 'user' | 'admin';
  status: 'active' | 'disabled';
  createdAt: string;
}

export interface UserDetails extends User {
  adoptions: Array<{
    _id: string;
    pet: {
      petName: string;
      type: string;
    };
    status: string;
    createdAt: string;
  }>;
  publications: Array<{
    _id: string;
    petName: string;
    type: string;
    status: string;
    createdAt: string;
  }>;
}

export async function getAllUsers() {
  return request<User[]>('/api/users', {
    method: 'GET',
  });
}

export async function getUser(id: string) {
  return request<UserDetails>(`/api/users/${id}`, {
    method: 'GET',
  });
}

export async function updateUserStatus(id: string, status: string) {
  return request<User>(`/api/users/${id}/status`, {
    method: 'PUT',
    data: { status },
  });
}

export async function deleteUser(id: string) {
  return request<void>(`/api/users/${id}`, {
    method: 'DELETE',
  });
}
