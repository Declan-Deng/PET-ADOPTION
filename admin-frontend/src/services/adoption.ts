import { request } from '@umijs/max';

export interface Adoption {
  _id: string;
  pet: {
    _id: string;
    petName: string;
    type: string;
  };
  applicant: {
    _id: string;
    username: string;
    profile: {
      name: string;
      phone: string;
    };
  };
  status: 'active' | 'approved' | 'cancelled';
  reason: string;
  experience: string;
  livingCondition: string;
  createdAt: string;
}

export async function getAllAdoptions(params?: {
  'pet.petName'?: string;
  'pet.type'?: string;
  'applicant.profile.name'?: string;
  startTime?: string;
  endTime?: string;
  status?: string;
}) {
  return request<{
    message: string;
    data: Adoption[];
  }>('/api/adoptions/all', {
    method: 'GET',
    params,
  });
}

export async function approveAdoption(id: string) {
  return request<{
    message: string;
    data: Adoption;
  }>(`/api/adoptions/${id}/approve`, {
    method: 'PUT',
  });
}

export async function rejectAdoption(id: string) {
  return request<void>(`/api/adoptions/${id}/reject`, {
    method: 'POST',
  });
}

export async function deleteAdoption(id: string) {
  return request<{
    message: string;
  }>(`/api/adoptions/${id}`, {
    method: 'DELETE',
  });
}
