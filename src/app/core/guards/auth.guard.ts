import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, first } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    first(),
    map((isAuthenticated) => (isAuthenticated ? true : router.createUrlTree(['/login']))),
  );
};
