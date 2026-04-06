import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  SettingsApiService,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from './settings-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/auth/auth.models';

export interface SettingsState {
  profileSaving: boolean;
  profileError: string | null;
  passwordSaving: boolean;
  passwordError: string | null;
  passwordSuccess: boolean;
}

const initialState: SettingsState = {
  profileSaving: false,
  profileError: null,
  passwordSaving: false,
  passwordError: null,
  passwordSuccess: false,
};

@Injectable({ providedIn: 'root' })
export class SettingsStore {
  private readonly api = inject(SettingsApiService);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  private readonly _state$ = new BehaviorSubject<SettingsState>(initialState);
  readonly state$ = this._state$.asObservable();

  private patch(partial: Partial<SettingsState>): void {
    this._state$.next({ ...this._state$.value, ...partial });
  }

  updateProfile(data: UpdateProfileRequest): Observable<User> {
    this.patch({ profileSaving: true, profileError: null });
    return new Observable<User>((observer) => {
      this.api
        .updateProfile(data)
        .pipe(
          tap((user) => {
            this.authService.setUser(user);
            this.snackBar.open('Profile updated.', 'Dismiss', { duration: 3000 });
            observer.next(user);
            observer.complete();
          }),
          catchError((err) => {
            const msg = err?.error?.message ?? 'Failed to update profile.';
            this.patch({ profileError: msg });
            observer.error(err);
            return EMPTY;
          }),
          finalize(() => this.patch({ profileSaving: false })),
        )
        .subscribe();
    });
  }

  changePassword(data: ChangePasswordRequest): Observable<void> {
    this.patch({ passwordSaving: true, passwordError: null, passwordSuccess: false });
    return new Observable<void>((observer) => {
      this.api
        .changePassword(data)
        .pipe(
          tap(() => {
            this.patch({ passwordSuccess: true });
            this.snackBar.open('Password changed successfully.', 'Dismiss', { duration: 4000 });
            observer.next();
            observer.complete();
          }),
          catchError((err) => {
            const msg = err?.error?.message ?? 'Failed to change password.';
            this.patch({ passwordError: msg });
            observer.error(err);
            return EMPTY;
          }),
          finalize(() => this.patch({ passwordSaving: false })),
        )
        .subscribe();
    });
  }

  clearPasswordState(): void {
    this.patch({ passwordError: null, passwordSuccess: false });
  }
}
