import { request } from '@umijs/max';

export interface Pet {
  _id: string;
  petName: string;
  type: 'cat' | 'dog' | 'other';
  breed: string;
  age: number;
  gender: 'male' | 'female' | 'unknown';
  description: string;
  requirements: string;
  images: string[];
  medical: {
    vaccinated: boolean;
    sterilized: boolean;
    healthStatus: '健康' | '亚健康' | '需要治疗';
  };
  status: 'available' | 'pending' | 'adopted';
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export async function getAllPets(params?: {
  petName?: string;
  'owner.username'?: string;
  type?: string;
  gender?: string;
  'medical.healthStatus'?: string;
  'medical.vaccinated'?: boolean;
  'medical.sterilized'?: boolean;
  status?: string;
  startTime?: string;
  endTime?: string;
}) {
  return request<Pet[]>('/api/pets', {
    method: 'GET',
    params,
  });
}

export async function getPet(id: string) {
  return request<Pet>(`/api/pets/${id}`, {
    method: 'GET',
  });
}

export async function createPet(
  data: Omit<Pet, '_id' | 'owner' | 'createdAt' | 'updatedAt'>,
) {
  return request<Pet>('/api/pets', {
    method: 'POST',
    data,
  });
}

export async function updatePet(id: string, data: Partial<Pet>) {
  return request<Pet>(`/api/pets/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function deletePet(id: string) {
  return request<void>(`/api/pets/${id}`, {
    method: 'DELETE',
  });
}
