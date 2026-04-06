import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsStore } from './settings.store';
import { SettingsApiService } from './settings-api.service';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/auth/auth.models';

const mockUser: User = {
  id: 'u1',
  email: 'test@example.com',
  name: 'Alice',
  emailVerified: true,
  timezone: null,
  providers: ['credentials'],
  createdAt: '2024-01-01T00:00:00Z',
};

const makeApiMock = () => ({
  updateProfile: vi.fn().mockReturnValue(of(mockUser)),
  changePassword: vi.fn().mockReturnValue(of(undefined as unknown as void)),
});

describe('SettingsStore', () => {
  let store: SettingsStore;
  let apiMock: ReturnType<typeof makeApiMock>;
  let authServiceMock: { setUser: ReturnType<typeof vi.fn> };
  let snackBarMock: { open: ReturnType<typeof vi.fn> };

  const setup = (apiOverrides: Partial<ReturnType<typeof makeApiMock>> = {}) => {
    apiMock = { ...makeApiMock(), ...apiOverrides };
    authServiceMock = { setUser: vi.fn() };
    snackBarMock = { open: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        SettingsStore,
        { provide: SettingsApiService, useValue: apiMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
      ],
    });
    store = TestBed.inject(SettingsStore);
  };

  it('should start with clean state', async () => {
    setup();
    const s = await firstValueFrom(store.state$);
    expect(s.profileSaving).toBe(false);
    expect(s.profileError).toBeNull();
    expect(s.passwordSaving).toBe(false);
    expect(s.passwordError).toBeNull();
    expect(s.passwordSuccess).toBe(false);
  });

  describe('updateProfile()', () => {
    it('should call setUser and show snackbar on success', async () => {
      setup();
      await firstValueFrom(store.updateProfile({ name: 'Alice' }));
      expect(authServiceMock.setUser).toHaveBeenCalledWith(mockUser);
      expect(snackBarMock.open).toHaveBeenCalledWith('Profile updated.', 'Dismiss', {
        duration: 3000,
      });
      const s = await firstValueFrom(store.state$);
      expect(s.profileSaving).toBe(false);
      expect(s.profileError).toBeNull();
    });

    it('should set profileError on failure', async () => {
      setup({
        updateProfile: vi
          .fn()
          .mockReturnValue(throwError(() => ({ error: { message: 'Not found.' } }))),
      });
      try {
        await firstValueFrom(store.updateProfile({ name: 'X' }));
      } catch {}
      const s = await firstValueFrom(store.state$);
      expect(s.profileError).toBe('Not found.');
      expect(s.profileSaving).toBe(false);
    });
  });

  describe('changePassword()', () => {
    it('should set passwordSuccess and show snackbar on success', async () => {
      setup();
      await firstValueFrom(
        store.changePassword({ currentPassword: 'old', newPassword: 'new12345' }),
      );
      const s = await firstValueFrom(store.state$);
      expect(s.passwordSuccess).toBe(true);
      expect(s.passwordSaving).toBe(false);
      expect(snackBarMock.open).toHaveBeenCalledWith('Password changed successfully.', 'Dismiss', {
        duration: 4000,
      });
    });

    it('should set passwordError on failure', async () => {
      setup({
        changePassword: vi
          .fn()
          .mockReturnValue(throwError(() => ({ error: { message: 'Wrong password.' } }))),
      });
      try {
        await firstValueFrom(
          store.changePassword({ currentPassword: 'wrong', newPassword: 'new12345' }),
        );
      } catch {}
      const s = await firstValueFrom(store.state$);
      expect(s.passwordError).toBe('Wrong password.');
      expect(s.passwordSuccess).toBe(false);
    });
  });

  describe('clearPasswordState()', () => {
    it('should clear passwordError and passwordSuccess', async () => {
      setup({
        changePassword: vi.fn().mockReturnValue(throwError(() => ({ error: { message: 'err' } }))),
      });
      try {
        await firstValueFrom(store.changePassword({ currentPassword: 'x', newPassword: 'y12345' }));
      } catch {}
      store.clearPasswordState();
      const s = await firstValueFrom(store.state$);
      expect(s.passwordError).toBeNull();
      expect(s.passwordSuccess).toBe(false);
    });
  });
});
