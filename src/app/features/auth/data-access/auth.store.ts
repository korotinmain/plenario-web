import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, EMPTY } from 'rxjs';
import { catchError, tap, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthApiService } from '../data-access/auth-api.service';
import {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '../models/auth-request.models';

export type LoginError = 'unverified_email' | 'invalid_credentials' | 'unknown';

export interface AuthStoreState {
  registerLoading: boolean;
  registerError: string | null;
  registerSuccess: boolean;
  loginLoading: boolean;
  loginError: string | null;
  loginErrorType: LoginError | null;
  unverifiedEmail: string | null;
  resendLoading: boolean;
  resendSuccess: boolean;
  resendError: string | null;
  forgotPasswordLoading: boolean;
  forgotPasswordError: string | null;
  forgotPasswordSuccess: boolean;
  resetPasswordLoading: boolean;
  resetPasswordError: string | null;
  resetPasswordSuccess: boolean;
}

const initialState: AuthStoreState = {
  registerLoading: false,
  registerError: null,
  registerSuccess: false,
  loginLoading: false,
  loginError: null,
  loginErrorType: null,
  unverifiedEmail: null,
  resendLoading: false,
  resendSuccess: false,
  resendError: null,
  forgotPasswordLoading: false,
  forgotPasswordError: null,
  forgotPasswordSuccess: false,
  resetPasswordLoading: false,
  resetPasswordError: null,
  resetPasswordSuccess: false,
};

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly _state$ = new BehaviorSubject<AuthStoreState>(initialState);
  readonly state$ = this._state$.asObservable();

  constructor(
    private readonly authService: AuthService,
    private readonly authApiService: AuthApiService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
  ) {}

  private patch(partial: Partial<AuthStoreState>): void {
    this._state$.next({ ...this._state$.value, ...partial });
  }

  register(data: RegisterRequest): Observable<void> {
    this.patch({ registerLoading: true, registerError: null, registerSuccess: false });

    return new Observable<void>((observer) => {
      this.authApiService
        .register(data)
        .pipe(
          tap(() => {
            this.patch({ registerSuccess: true });
          }),
          catchError((err) => {
            const message = this.extractErrorMessage(err, 'Registration failed. Please try again.');
            this.patch({ registerError: message });
            observer.error(err);
            return EMPTY;
          }),
          finalize(() => {
            this.patch({ registerLoading: false });
            observer.complete();
          }),
        )
        .subscribe({
          next: () => observer.next(),
        });
    });
  }

  login(data: LoginRequest): Observable<void> {
    this.patch({
      loginLoading: true,
      loginError: null,
      loginErrorType: null,
      unverifiedEmail: null,
    });

    return new Observable<void>((observer) => {
      this.authApiService
        .login(data)
        .pipe(
          tap((response) => {
            this.authService.setToken(response.accessToken);
            this.authService.setUser(response.user);
            this.router.navigate(['/dashboard']);
          }),
          catchError((err) => {
            const status: number = err?.status ?? 0;
            const serverMessage: string = err?.error?.message ?? '';

            let loginErrorType: LoginError = 'unknown';
            let loginError = 'Something went wrong. Please try again.';
            let unverifiedEmail: string | null = null;

            if (status === 401) {
              if (
                serverMessage.toLowerCase().includes('verify') ||
                serverMessage.toLowerCase().includes('confirm') ||
                serverMessage.toLowerCase().includes('unverified')
              ) {
                loginErrorType = 'unverified_email';
                loginError = 'Your email is not verified. Please check your inbox.';
                unverifiedEmail = data.email;
              } else {
                loginErrorType = 'invalid_credentials';
                loginError = 'Invalid email or password.';
              }
            }

            this.patch({ loginError, loginErrorType, unverifiedEmail });
            observer.error(err);
            return EMPTY;
          }),
          finalize(() => {
            this.patch({ loginLoading: false });
            observer.complete();
          }),
        )
        .subscribe({
          next: () => observer.next(),
        });
    });
  }

  resendConfirmation(email: string): Observable<void> {
    this.patch({ resendLoading: true, resendError: null, resendSuccess: false });

    return new Observable<void>((observer) => {
      this.authApiService
        .resendConfirmation({ email })
        .pipe(
          tap(() => {
            this.patch({ resendSuccess: true });
            this.snackBar.open('Confirmation email sent.', 'Dismiss', { duration: 4000 });
          }),
          catchError((err) => {
            const message = this.extractErrorMessage(err, 'Could not send confirmation email.');
            this.patch({ resendError: message });
            observer.error(err);
            return EMPTY;
          }),
          finalize(() => {
            this.patch({ resendLoading: false });
            observer.complete();
          }),
        )
        .subscribe({
          next: () => observer.next(),
        });
    });
  }

  logout(): void {
    this.authApiService.logout().subscribe({
      complete: () => {
        this.authService.clearSession();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.authService.clearSession();
        this.router.navigate(['/login']);
      },
    });
  }

  forgotPassword(data: ForgotPasswordRequest): Observable<void> {
    this.patch({
      forgotPasswordLoading: true,
      forgotPasswordError: null,
      forgotPasswordSuccess: false,
    });

    return new Observable<void>((observer) => {
      this.authApiService
        .forgotPassword(data)
        .pipe(
          tap(() => {
            this.patch({ forgotPasswordSuccess: true });
          }),
          catchError((err) => {
            const message = this.extractErrorMessage(
              err,
              'Failed to send reset email. Please try again.',
            );
            this.patch({ forgotPasswordError: message });
            observer.error(err);
            return EMPTY;
          }),
          finalize(() => {
            this.patch({ forgotPasswordLoading: false });
            observer.complete();
          }),
        )
        .subscribe({ next: () => observer.next() });
    });
  }

  resetPassword(data: ResetPasswordRequest): Observable<void> {
    this.patch({
      resetPasswordLoading: true,
      resetPasswordError: null,
      resetPasswordSuccess: false,
    });

    return new Observable<void>((observer) => {
      this.authApiService
        .resetPassword(data)
        .pipe(
          tap(() => {
            this.patch({ resetPasswordSuccess: true });
          }),
          catchError((err) => {
            const message = this.extractErrorMessage(
              err,
              'Failed to reset password. The link may have expired.',
            );
            this.patch({ resetPasswordError: message });
            observer.error(err);
            return EMPTY;
          }),
          finalize(() => {
            this.patch({ resetPasswordLoading: false });
            observer.complete();
          }),
        )
        .subscribe({ next: () => observer.next() });
    });
  }

  resetRegisterState(): void {
    this.patch({ registerError: null, registerSuccess: false });
  }

  resetForgotPasswordState(): void {
    this.patch({
      forgotPasswordLoading: false,
      forgotPasswordError: null,
      forgotPasswordSuccess: false,
    });
  }

  resetResetPasswordState(): void {
    this.patch({
      resetPasswordLoading: false,
      resetPasswordError: null,
      resetPasswordSuccess: false,
    });
  }

  resetLoginState(): void {
    this.patch({
      loginError: null,
      loginErrorType: null,
      unverifiedEmail: null,
      resendError: null,
      resendSuccess: false,
    });
  }

  private extractErrorMessage(err: unknown, fallback: string): string {
    if (
      err &&
      typeof err === 'object' &&
      'error' in err &&
      err.error &&
      typeof err.error === 'object' &&
      'message' in err.error
    ) {
      return String((err as { error: { message: string } }).error.message);
    }
    return fallback;
  }
}
