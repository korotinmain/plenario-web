import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _state$ = new BehaviorSubject<{
    user: User | null;
    initialized: boolean;
  }>({ user: null, initialized: false });

  readonly user$ = this._state$.pipe(map((s) => s.user));
  readonly isAuthenticated$ = this.user$.pipe(map((u) => u !== null));
  readonly initialized$ = this._state$.pipe(map((s) => s.initialized));

  /**
   * Bootstrap the session from the /me API endpoint.
   * Stub for Increment 0 — will be connected to the API in Increment 1.
   */
  bootstrapSession(): Observable<void> {
    this._state$.next({ user: null, initialized: true });
    return of(void 0);
  }

  setUser(user: User): void {
    this._state$.next({ user, initialized: true });
  }

  clearSession(): void {
    this._state$.next({ user: null, initialized: true });
  }
}
