export type AuthProvider = 'credentials' | 'google';

export interface User {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  timezone: string | null;
  providers: AuthProvider[];
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  initialized: boolean;
}
