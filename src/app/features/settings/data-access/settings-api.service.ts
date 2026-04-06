import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/auth/auth.models';

export interface UpdateProfileRequest {
  name?: string | null;
  timezone?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class SettingsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/users`;

  updateProfile(data: UpdateProfileRequest): Observable<User> {
    return this.http.patch<User>(`${this.base}/me`, data);
  }

  changePassword(data: ChangePasswordRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiBaseUrl}/auth/change-password`, data);
  }
}
