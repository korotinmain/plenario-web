import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  template: `
    <div class="auth-page">
      <h2 class="auth-title">Sign in to Plenario</h2>
      <p class="auth-subtitle text-muted">Full form implemented in Increment 1.</p>
      <div class="auth-links">
        <a mat-stroked-button routerLink="/register">Create account</a>
        <a mat-button routerLink="/forgot-password">Forgot password?</a>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-page {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .auth-title {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--mat-sys-on-surface);
        letter-spacing: -0.02em;
      }
      .auth-subtitle {
        margin: 0;
        font-size: 0.875rem;
      }
      .auth-links {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 8px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {}
