import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom, Observable, of } from 'rxjs';
import { authGuard } from './auth.guard';
import { AuthService } from '../auth/auth.service';
import { provideRouter } from '@angular/router';

describe('authGuard', () => {
  const setup = (isAuthenticated: boolean) => {
    const authServiceMock = { isAuthenticated$: of(isAuthenticated) };
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authServiceMock }, provideRouter([])],
    });
  };

  it('should redirect to /login when not authenticated', async () => {
    setup(false);
    const result$ = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as Observable<boolean | UrlTree>;
    const result = await firstValueFrom(result$);
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/login');
  });

  it('should return true when authenticated', async () => {
    setup(true);
    const result$ = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as Observable<boolean | UrlTree>;
    const result = await firstValueFrom(result$);
    expect(result).toBe(true);
  });
});
