import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { User } from './auth.models';
import { environment } from '../../../environments/environment';

const mockUser: User = {
  id: 'test-id',
  email: 'test@example.com',
  name: 'Test User',
  emailVerified: true,
  timezone: null,
  providers: ['credentials'],
  createdAt: '2024-01-01T00:00:00Z',
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with no user', async () => {
    const user = await firstValueFrom(service.user$);
    expect(user).toBeNull();
  });

  it('should start as not authenticated', async () => {
    const isAuthenticated = await firstValueFrom(service.isAuthenticated$);
    expect(isAuthenticated).toBe(false);
  });

  it('should start as not initialized', async () => {
    const initialized = await firstValueFrom(service.initialized$);
    expect(initialized).toBe(false);
  });

  describe('bootstrapSession()', () => {
    it('should set user and mark initialized on 200 response', async () => {
      const bootstrap$ = service.bootstrapSession();
      const promise = firstValueFrom(bootstrap$);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/me`);
      expect(req.request.withCredentials).toBe(true);
      req.flush(mockUser);

      await promise;

      const user = await firstValueFrom(service.user$);
      const initialized = await firstValueFrom(service.initialized$);
      expect(user).toEqual(mockUser);
      expect(initialized).toBe(true);
    });

    it('should set user to null and mark initialized on 401', async () => {
      const bootstrap$ = service.bootstrapSession();
      const promise = firstValueFrom(bootstrap$);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/me`);
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      await promise;

      const user = await firstValueFrom(service.user$);
      const initialized = await firstValueFrom(service.initialized$);
      expect(user).toBeNull();
      expect(initialized).toBe(true);
    });

    it('should set user to null and mark initialized on network error', async () => {
      const bootstrap$ = service.bootstrapSession();
      const promise = firstValueFrom(bootstrap$);

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/me`);
      req.error(new ProgressEvent('network error'));

      await promise;

      const initialized = await firstValueFrom(service.initialized$);
      expect(initialized).toBe(true);
      const user = await firstValueFrom(service.user$);
      expect(user).toBeNull();
    });
  });

  describe('setUser()', () => {
    it('should set the user and mark authenticated', async () => {
      service.setUser(mockUser);
      const user = await firstValueFrom(service.user$);
      const isAuthenticated = await firstValueFrom(service.isAuthenticated$);
      expect(user).toEqual(mockUser);
      expect(isAuthenticated).toBe(true);
    });
  });

  describe('clearSession()', () => {
    it('should clear the user and mark as not authenticated', async () => {
      service.setUser(mockUser);
      service.clearSession();
      const user = await firstValueFrom(service.user$);
      const isAuthenticated = await firstValueFrom(service.isAuthenticated$);
      expect(user).toBeNull();
      expect(isAuthenticated).toBe(false);
    });
  });
});
