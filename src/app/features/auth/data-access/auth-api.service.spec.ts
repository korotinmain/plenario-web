import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthApiService } from './auth-api.service';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/auth/auth.models';

const base = `${environment.apiBaseUrl}/auth`;

const mockUser: User = {
  id: 'u1',
  email: 'test@example.com',
  name: 'Test',
  emailVerified: true,
  timezone: null,
  providers: ['credentials'],
  createdAt: '2024-01-01T00:00:00Z',
};

describe('AuthApiService', () => {
  let service: AuthApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('register()', () => {
    it('should POST to /auth/register', () => {
      const payload = { email: 'a@b.com', password: 'password123' };
      service.register(payload).subscribe();

      const req = httpMock.expectOne(`${base}/register`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush({ message: 'Check your email.' });
    });
  });

  describe('login()', () => {
    it('should POST to /auth/login with withCredentials', () => {
      const payload = { email: 'a@b.com', password: 'password123' };
      service.login(payload).subscribe();

      const req = httpMock.expectOne(`${base}/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBe(true);
      req.flush({ user: mockUser, accessToken: 'tok' });
    });
  });

  describe('me()', () => {
    it('should GET /auth/me with withCredentials', () => {
      service.me().subscribe();

      const req = httpMock.expectOne(`${base}/me`);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockUser);
    });
  });

  describe('logout()', () => {
    it('should POST to /auth/logout with withCredentials', () => {
      service.logout().subscribe();

      const req = httpMock.expectOne(`${base}/logout`);
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBe(true);
      req.flush(null);
    });
  });

  describe('forgotPassword()', () => {
    it('should POST to /auth/forgot-password', () => {
      service.forgotPassword({ email: 'a@b.com' }).subscribe();

      const req = httpMock.expectOne(`${base}/forgot-password`);
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'If that email exists...' });
    });
  });

  describe('resetPassword()', () => {
    it('should POST to /auth/reset-password', () => {
      service.resetPassword({ token: 'tok123', password: 'newpass123' }).subscribe();

      const req = httpMock.expectOne(`${base}/reset-password`);
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Password reset.' });
    });
  });

  describe('resendConfirmation()', () => {
    it('should POST to /auth/resend-confirmation', () => {
      service.resendConfirmation({ email: 'a@b.com' }).subscribe();

      const req = httpMock.expectOne(`${base}/resend-confirmation`);
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Email sent.' });
    });
  });
});
