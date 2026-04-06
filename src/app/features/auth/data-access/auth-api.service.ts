import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/auth/auth.models';
import {
  RegisterRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ResendConfirmationRequest,
} from '../models/auth-request.models';
import { AuthResponse, MessageResponse } from '../models/auth-response.models';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly base = `${environment.apiBaseUrl}/auth`;

  constructor(private readonly http: HttpClient) {}

  register(body: RegisterRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.base}/register`, body);
  }

  login(body: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/login`, body, {
      withCredentials: true,
    });
  }

  me(): Observable<User> {
    return this.http.get<User>(`${this.base}/me`, { withCredentials: true });
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.base}/logout`, {}, { withCredentials: true });
  }

  forgotPassword(body: ForgotPasswordRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.base}/forgot-password`, body);
  }

  resetPassword(body: ResetPasswordRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.base}/reset-password`, body);
  }

  resendConfirmation(body: ResendConfirmationRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${this.base}/resend-confirmation`, body);
  }

  confirmEmail(token: string): Observable<MessageResponse> {
    return this.http.get<MessageResponse>(`${this.base}/confirm-email`, {
      params: { token },
    });
  }

  googleLogin(): void {
    window.location.href = `${this.base}/google`;
  }
}
