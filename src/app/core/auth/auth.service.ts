import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { User } from './auth.models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _state$ = new BehaviorSubject<{
    user: User | null;
    initialized: boolean;
  }>({ user: null, initialized: false });

  readonly user$ = this._state$.pipe(map((s) => s.user));
  readonly isAuthenticated$ = this.user$.pipe(map((u) => u !== null));
  readonly initialized$ = this._state$.pipe(map((s) => s.initialized));

  constructor(private readonly http: HttpClient) {}

  bootstrapSession(): Observable<void> {
    return this.http.get<User>(`${environment.apiBaseUrl}/auth/me`, { withCredentials: true }).pipe(
      tap((user) => this._state$.next({ user, initialized: true })),
      map(() => void 0),
      catchError(() => {
        this._state$.next({ user: null, initialized: true });
        return of(void 0);
      }),
    );
  }

  setUser(user: User): void {
    this._state$.next({ user, initialized: true });
  }

  clearSession(): void {
    this._state$.next({ user: null, initialized: true });
  }
}
