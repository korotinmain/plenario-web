import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { firstValueFrom, Observable, of } from 'rxjs';
import { publicGuard } from './public.guard';
import { AuthService } from '../auth/auth.service';
import { provideRouter } from '@angular/router';

describe('publicGuard', () => {
  const setup = (isAuthenticated: boolean) => {
    const authServiceMock = { isAuthenticated$: of(isAuthenticated) };
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authServiceMock }, provideRouter([])],
    });
  };

  it('should allow access when not authenticated', async () => {
    setup(false);
    const result$ = TestBed.runInInjectionContext(() =>
      publicGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as Observable<boolean | UrlTree>;
    const result = await firstValueFrom(result$);
    expect(result).toBe(true);
  });

  it('should redirect to /dashboard when authenticated', async () => {
    setup(true);
    const result$ = TestBed.runInInjectionContext(() =>
      publicGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as Observable<boolean | UrlTree>;
    const result = await firstValueFrom(result$);
    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/dashboard');
  });
});
