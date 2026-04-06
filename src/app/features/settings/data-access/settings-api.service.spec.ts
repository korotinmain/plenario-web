import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { SettingsApiService } from './settings-api.service';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/auth/auth.models';

const base = `${environment.apiBaseUrl}/users`;

const mockUser: User = {
  id: 'u1',
  email: 'test@example.com',
  name: 'Alice',
  emailVerified: true,
  timezone: null,
  providers: ['credentials'],
  createdAt: '2024-01-01T00:00:00Z',
};

describe('SettingsApiService', () => {
  let service: SettingsApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SettingsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('updateProfile()', () => {
    it('should PATCH /users/me with the profile data', () => {
      let result: User | undefined;
      service.updateProfile({ name: 'Alice' }).subscribe((u) => (result = u));

      const req = httpMock.expectOne(`${base}/me`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual({ name: 'Alice' });
      req.flush(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should PATCH with null name to clear it', () => {
      service.updateProfile({ name: null }).subscribe();

      const req = httpMock.expectOne(`${base}/me`);
      expect(req.request.body).toEqual({ name: null });
      req.flush(mockUser);
    });
  });

  describe('changePassword()', () => {
    it('should POST to /auth/change-password with credentials', () => {
      let completed = false;
      service
        .changePassword({ currentPassword: 'old123', newPassword: 'new456' })
        .subscribe(() => (completed = true));

      const req = httpMock.expectOne(`${environment.apiBaseUrl}/auth/change-password`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ currentPassword: 'old123', newPassword: 'new456' });
      req.flush(null);
      expect(completed).toBe(true);
    });
  });
});
