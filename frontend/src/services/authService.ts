import api from './api';

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'Residente' | 'Administrador' | 'Encargado';
}

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const { data } = await api.post<{ success: true; data: { token: string; user: User } }>('/auth/login', { email, password });
  return data.data;
}
