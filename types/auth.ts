export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'STUDENT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  organizationId?: string; // Optional for Super Admin
}

export interface LoginCredentials {
  email: string;
  password?: string;
}
