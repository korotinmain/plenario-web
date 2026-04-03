import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-page">
      <div class="confirm-header">
        <mat-icon class="confirm-icon">mark_email_read</mat-icon>
        <h1 class="confirm-title">Confirm your email</h1>
        <p class="confirm-message text-muted">
          Full confirmation handling implemented in Increment 2.
        </p>
      </div>
      <a mat-raised-button routerLink="/login">Go to sign in</a>
    </div>
  `,
  styles: [
    `
      .confirm-page {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px;
        gap: 24px;
        background-color: var(--mat-sys-surface-container-low);
      }
      .confirm-header {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }
      .confirm-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: var(--mat-sys-primary);
      }
      .confirm-title {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--mat-sys-on-surface);
        letter-spacing: -0.02em;
      }
      .confirm-message {
        margin: 0;
        max-width: 320px;
        text-align: center;
        font-size: 0.875rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmEmailComponent {}
