import { api } from '../../../shared/api/axiosInstance';
import type { MessageResponse, UserCreate, UserPublic } from '../../usuarios';

export async function postLogin(username: string, password: string): Promise<MessageResponse> {
  // OAuth2PasswordRequestForm: application/x-www-form-urlencoded
  const form = new URLSearchParams({ username, password });
  const { data } = await api.post<MessageResponse>('/auth/token', form);
  return data;
}

export async function postRegister(payload: UserCreate): Promise<UserPublic> {
  const { data } = await api.post<UserPublic>('/auth/register', payload);
  return data;
}

export async function postLogout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function getMe(): Promise<UserPublic> {
  const { data } = await api.get<UserPublic>('/auth/me');
  return data;
}
