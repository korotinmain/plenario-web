import { User } from '../../../core/auth/auth.models';

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface MessageResponse {
  message: string;
}
