import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthApiService } from '../../data-access/auth-api.service';

type ConfirmState = 'loading' | 'success' | 'error' | 'no-token';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth-page">
      @switch (state()) {
        @case ('loading') {
          <div class="flex flex-col items-center gap-5 py-4">
            <mat-spinner diameter="44" />
            <div class="auth-header" style="text-align:center">
              <h1 class="auth-title">Confirming your email…</h1>
              <p class="auth-subtitle">Please wait a moment.</p>
            </div>
          </div>
        }

        @case ('success') {
          <div class="flex flex-col items-center gap-4 py-2">
            <div class="flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-50">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke="#22c55e"
                  stroke-width="1.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="auth-header" style="text-align:center">
              <h1 class="auth-title">Email confirmed!</h1>
              <p class="auth-subtitle">
                Your email has been verified. You can now sign in to Plenario.
              </p>
            </div>
          </div>

          <a mat-flat-button routerLink="/login" class="submit-btn">
            <span>Sign in</span>
            <svg class="btn-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </a>
        }

        @case ('error') {
          <div class="flex flex-col items-center gap-4 py-2">
            <div class="flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-50">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  stroke="#ef4444"
                  stroke-width="1.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="auth-header" style="text-align:center">
              <h1 class="auth-title">Link expired or invalid</h1>
              <p class="auth-subtitle">{{ errorMessage() }}</p>
            </div>
          </div>

          <a mat-flat-button routerLink="/login" class="submit-btn">
            <span>Back to sign in</span>
            <svg class="btn-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </a>
        }

        @case ('no-token') {
          <div class="flex flex-col items-center gap-4 py-2">
            <div class="flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  stroke="#f59e0b"
                  stroke-width="1.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <div class="auth-header" style="text-align:center">
              <h1 class="auth-title">No confirmation token</h1>
              <p class="auth-subtitle">
                This link is missing a confirmation token. Please use the link from your email.
              </p>
            </div>
          </div>

          <a mat-flat-button routerLink="/login" class="submit-btn">
            <span>Back to sign in</span>
            <svg class="btn-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </a>
        }
      }

      <div class="auth-footer">
        <span class="auth-footer__text">Need help?</span>
        <a routerLink="/login" class="auth-footer__link">Contact support</a>
      </div>
    </div>
  `,
})
export class ConfirmEmailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly authApi = inject(AuthApiService);

  readonly state = signal<ConfirmState>('loading');
  readonly errorMessage = signal('The confirmation link may have expired or already been used.');

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.state.set('no-token');
      return;
    }

    this.authApi.confirmEmail(token).subscribe({
      next: () => this.state.set('success'),
      error: (err) => {
        const msg = err?.error?.message;
        if (msg) this.errorMessage.set(msg);
        this.state.set('error');
      },
    });
  }
}
