import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { User } from './auth.models';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

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
    it('should mark session as initialized after bootstrap', async () => {
      await firstValueFrom(service.bootstrapSession());
      const initialized = await firstValueFrom(service.initialized$);
      expect(initialized).toBe(true);
    });

    it('should leave user as null in Increment 0 stub', async () => {
      await firstValueFrom(service.bootstrapSession());
      const user = await firstValueFrom(service.user$);
      expect(user).toBeNull();
    });
  });

  describe('setUser()', () => {
    it('should set the user and mark authenticated', async () => {
      const mockUser: User = {
        id: 'test-id',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
        timezone: null,
        providers: ['credentials'],
        createdAt: '2024-01-01T00:00:00Z',
      };

      service.setUser(mockUser);

      const user = await firstValueFrom(service.user$);
      const isAuthenticated = await firstValueFrom(service.isAuthenticated$);

      expect(user).toEqual(mockUser);
      expect(isAuthenticated).toBe(true);
    });
  });

  describe('clearSession()', () => {
    it('should clear the user and mark as not authenticated', async () => {
      const mockUser: User = {
        id: 'test-id',
        email: 'test@example.com',
        name: null,
        emailVerified: true,
        timezone: null,
        providers: ['credentials'],
        createdAt: '2024-01-01T00:00:00Z',
      };

      service.setUser(mockUser);
      service.clearSession();

      const user = await firstValueFrom(service.user$);
      const isAuthenticated = await firstValueFrom(service.isAuthenticated$);

      expect(user).toBeNull();
      expect(isAuthenticated).toBe(false);
    });
  });
});
