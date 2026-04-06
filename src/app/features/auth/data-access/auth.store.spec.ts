import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom, of, throwError } from 'rxjs';
import { AuthStore } from './auth.store';
import { AuthApiService } from './auth-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/auth/auth.models';

const mockUser: User = {
  id: 'u1',
  email: 'test@example.com',
  name: 'Test',
  emailVerified: true,
  timezone: null,
  providers: ['credentials'],
  createdAt: '2024-01-01T00:00:00Z',
};

const makeAuthApiMock = (overrides: Partial<Record<keyof AuthApiService, unknown>> = {}) => ({
  register: vi.fn().mockReturnValue(of({ message: 'Check email.' })),
  login: vi.fn().mockReturnValue(of({ user: mockUser, accessToken: 'tok' })),
  logout: vi.fn().mockReturnValue(of(void 0)),
  resendConfirmation: vi.fn().mockReturnValue(of({ message: 'Sent.' })),
  me: vi.fn(),
  forgotPassword: vi.fn(),
  resetPassword: vi.fn(),
  googleLogin: vi.fn(),
  ...overrides,
});

const makeAuthServiceMock = () => ({
  setUser: vi.fn(),
  setToken: vi.fn(),
  clearSession: vi.fn(),
  clearToken: vi.fn(),
  user$: of(null),
  isAuthenticated$: of(false),
  initialized$: of(false),
});

describe('AuthStore', () => {
  let store: AuthStore;
  let authApiMock: ReturnType<typeof makeAuthApiMock>;
  let authServiceMock: ReturnType<typeof makeAuthServiceMock>;
  let snackBarMock: { open: ReturnType<typeof vi.fn> };

  const setup = (apiOverrides: Partial<Record<keyof AuthApiService, unknown>> = {}) => {
    authApiMock = makeAuthApiMock(apiOverrides);
    authServiceMock = makeAuthServiceMock();
    snackBarMock = { open: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideNoopAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate: vi.fn().mockResolvedValue(true) } },
        { provide: AuthApiService, useValue: authApiMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
      ],
    });
    store = TestBed.inject(AuthStore);
  };

  describe('register()', () => {
    it('should set registerSuccess on success', async () => {
      setup();
      await firstValueFrom(store.register({ email: 'a@b.com', password: 'pass1234' }));
      const state = await firstValueFrom(store.state$);
      expect(state.registerSuccess).toBe(true);
      expect(state.registerError).toBeNull();
      expect(state.registerLoading).toBe(false);
    });

    it('should set registerError on failure', async () => {
      setup({
        register: vi
          .fn()
          .mockReturnValue(
            throwError(() => ({ status: 409, error: { message: 'Email already in use.' } })),
          ),
      });

      try {
        await firstValueFrom(store.register({ email: 'a@b.com', password: 'pass1234' }));
      } catch {}

      const state = await firstValueFrom(store.state$);
      expect(state.registerError).toBe('Email already in use.');
      expect(state.registerSuccess).toBe(false);
      expect(state.registerLoading).toBe(false);
    });
  });

  describe('login()', () => {
    it('should call setUser and navigate to /dashboard on success', async () => {
      setup();
      await firstValueFrom(store.login({ email: 'a@b.com', password: 'pass1234' }));
      expect(authServiceMock.setUser).toHaveBeenCalledWith(mockUser);
      const state = await firstValueFrom(store.state$);
      expect(state.loginLoading).toBe(false);
      expect(state.loginError).toBeNull();
    });

    it('should set loginErrorType to unverified_email on 401 with verify keyword', async () => {
      setup({
        login: vi.fn().mockReturnValue(
          throwError(() => ({
            status: 401,
            error: { message: 'Please verify your email before logging in.' },
          })),
        ),
      });

      try {
        await firstValueFrom(store.login({ email: 'a@b.com', password: 'pass1234' }));
      } catch {}

      const state = await firstValueFrom(store.state$);
      expect(state.loginErrorType).toBe('unverified_email');
      expect(state.unverifiedEmail).toBe('a@b.com');
    });

    it('should set loginErrorType to invalid_credentials on 401 with generic message', async () => {
      setup({
        login: vi.fn().mockReturnValue(
          throwError(() => ({
            status: 401,
            error: { message: 'Invalid credentials.' },
          })),
        ),
      });

      try {
        await firstValueFrom(store.login({ email: 'a@b.com', password: 'wrongpass' }));
      } catch {}

      const state = await firstValueFrom(store.state$);
      expect(state.loginErrorType).toBe('invalid_credentials');
    });

    it('should set loginErrorType to unknown on non-401 error', async () => {
      setup({
        login: vi
          .fn()
          .mockReturnValue(
            throwError(() => ({ status: 500, error: { message: 'Server error.' } })),
          ),
      });

      try {
        await firstValueFrom(store.login({ email: 'a@b.com', password: 'pass1234' }));
      } catch {}

      const state = await firstValueFrom(store.state$);
      expect(state.loginErrorType).toBe('unknown');
    });
  });

  describe('resendConfirmation()', () => {
    it('should set resendSuccess and show snackbar on success', async () => {
      setup();
      await firstValueFrom(store.resendConfirmation('a@b.com'));
      const state = await firstValueFrom(store.state$);
      expect(state.resendSuccess).toBe(true);
      expect(snackBarMock.open).toHaveBeenCalledWith('Confirmation email sent.', 'Dismiss', {
        duration: 4000,
      });
    });

    it('should set resendError on failure', async () => {
      setup({
        resendConfirmation: vi
          .fn()
          .mockReturnValue(
            throwError(() => ({ status: 429, error: { message: 'Too many requests.' } })),
          ),
      });

      try {
        await firstValueFrom(store.resendConfirmation('a@b.com'));
      } catch {}

      const state = await firstValueFrom(store.state$);
      expect(state.resendError).toBe('Too many requests.');
    });
  });

  describe('logout()', () => {
    it('should clear session and call clearSession() synchronously', () => {
      setup();
      store.logout();
      // `of(void 0)` completes synchronously so clearSession is called immediately
      expect(authServiceMock.clearSession).toHaveBeenCalled();
    });
  });

  describe('resetRegisterState()', () => {
    it('should clear register error and success', async () => {
      setup({
        register: vi
          .fn()
          .mockReturnValue(throwError(() => ({ status: 409, error: { message: 'Exists.' } }))),
      });
      try {
        await firstValueFrom(store.register({ email: 'a@b.com', password: 'p' }));
      } catch {}
      store.resetRegisterState();
      const state = await firstValueFrom(store.state$);
      expect(state.registerError).toBeNull();
      expect(state.registerSuccess).toBe(false);
    });
  });

  describe('resetLoginState()', () => {
    it('should clear login error state', async () => {
      setup({
        login: vi
          .fn()
          .mockReturnValue(throwError(() => ({ status: 401, error: { message: 'Bad.' } }))),
      });
      try {
        await firstValueFrom(store.login({ email: 'a@b.com', password: 'p' }));
      } catch {}
      store.resetLoginState();
      const state = await firstValueFrom(store.state$);
      expect(state.loginError).toBeNull();
      expect(state.loginErrorType).toBeNull();
      expect(state.unverifiedEmail).toBeNull();
    });
  });
});
