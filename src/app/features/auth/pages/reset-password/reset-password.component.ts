import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  template: `
    <div class="auth-page">
      <h2 class="auth-title">Set a new password</h2>
      <p class="auth-subtitle text-muted">Full form implemented in Increment 2.</p>
      <a mat-button routerLink="/login">Back to sign in</a>
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent {}
