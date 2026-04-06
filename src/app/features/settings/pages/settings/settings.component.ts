import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [DatePipe, MatIconModule],
  template: `
    <!-- Page hero -->
    <div class="page-hero">
      <div>
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">Manage your profile and account preferences</p>
      </div>
    </div>

    @if (user()) {
      <!-- Profile card -->
      <div class="settings-card">
        <div class="settings-card__header">
          <mat-icon class="section-icon">person</mat-icon>
          <h2 class="settings-card__title">Profile</h2>
        </div>
        <div class="settings-card__body">
          <div class="avatar-row">
            <div class="avatar">
              {{ (user()!.name || user()!.email).charAt(0).toUpperCase() }}
            </div>
            <div class="avatar-info">
              <span class="avatar-name">{{ user()!.name ?? '—' }}</span>
              <span class="avatar-email">{{ user()!.email }}</span>
            </div>
          </div>
          <div class="field-grid">
            <div class="field">
              <label class="field__label">Display name</label>
              <div class="field__value">{{ user()!.name ?? 'Not set' }}</div>
            </div>
            <div class="field">
              <label class="field__label">Email address</label>
              <div class="field__value field__value--with-badge">
                {{ user()!.email }}
                @if (user()!.emailVerified) {
                  <span class="verified-badge">
                    <mat-icon class="verified-badge__icon">verified</mat-icon>
                    Verified
                  </span>
                } @else {
                  <span class="unverified-badge">Unverified</span>
                }
              </div>
            </div>
            @if (user()!.timezone) {
              <div class="field">
                <label class="field__label">Timezone</label>
                <div class="field__value">{{ user()!.timezone }}</div>
              </div>
            }
          </div>
        </div>
        <div class="settings-card__footer">
          <span class="coming-soon-note">
            <mat-icon class="coming-soon-note__icon">info</mat-icon>
            Profile editing will be available in Increment 6.
          </span>
        </div>
      </div>

      <!-- Account card -->
      <div class="settings-card">
        <div class="settings-card__header">
          <mat-icon class="section-icon">manage_accounts</mat-icon>
          <h2 class="settings-card__title">Account</h2>
        </div>
        <div class="settings-card__body">
          <div class="field-grid">
            <div class="field">
              <label class="field__label">Member since</label>
              <div class="field__value">{{ user()!.createdAt | date: 'MMMM d, y' }}</div>
            </div>
            <div class="field">
              <label class="field__label">Sign-in methods</label>
              <div class="field__value providers-row">
                @for (p of user()!.providers; track p) {
                  @if (p === 'google') {
                    <span class="provider-chip provider-chip--google">
                      <svg
                        class="provider-chip__icon"
                        viewBox="0 0 18 18"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                          fill="#4285F4"
                        />
                        <path
                          d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                          fill="#34A853"
                        />
                        <path
                          d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
                          fill="#EA4335"
                        />
                      </svg>
                      Google
                    </span>
                  } @else {
                    <span class="provider-chip provider-chip--email">
                      <mat-icon class="provider-chip__icon provider-chip__icon--mat"
                        >email</mat-icon
                      >
                      Email & Password
                    </span>
                  }
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Security card -->
      <div class="settings-card">
        <div class="settings-card__header">
          <mat-icon class="section-icon section-icon--amber">lock</mat-icon>
          <h2 class="settings-card__title">Security</h2>
        </div>
        <div class="settings-card__body">
          @if (hasCredentials()) {
            <div class="security-row">
              <div class="security-row__info">
                <span class="security-row__label">Password</span>
                <span class="security-row__desc">Change your account password</span>
              </div>
              <div class="coming-soon-chip">Coming in Increment 6</div>
            </div>
          } @else {
            <div class="security-notice">
              <mat-icon class="security-notice__icon">info</mat-icon>
              <div>
                <p class="security-notice__title">Password not available</p>
                <p class="security-notice__desc">
                  Your account uses Google sign-in. Password management is not applicable.
                </p>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        animation: fadeInUp 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      .page-hero {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 28px;
      }
      .page-title {
        margin: 0 0 6px;
        font-size: 1.75rem;
        font-weight: 800;
        color: var(--pln-text-1, #18181b);
        letter-spacing: -0.04em;
        line-height: 1.1;
      }
      .page-subtitle {
        margin: 0;
        font-size: 0.875rem;
        color: var(--pln-text-3, #71717a);
        font-weight: 500;
      }

      .settings-card {
        background: var(--pln-card-bg, #fff);
        border: 1px solid var(--pln-card-border, #e4e4e7);
        border-radius: 16px;
        box-shadow: var(--pln-card-shadow);
        margin-bottom: 20px;
        overflow: hidden;
      }
      .settings-card__header {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 16px 24px;
        border-bottom: 1px solid var(--pln-card-border, #e4e4e7);
      }
      .settings-card__title {
        margin: 0;
        font-size: 0.9375rem;
        font-weight: 700;
        color: var(--pln-text-1, #18181b);
        letter-spacing: -0.02em;
      }
      .settings-card__body {
        padding: 24px;
      }
      .settings-card__footer {
        padding: 12px 24px;
        border-top: 1px solid var(--pln-card-border, #e4e4e7);
        background: #fafafa;
      }

      .section-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #2563eb;
      }
      .section-icon--amber {
        color: #f59e0b;
      }

      .avatar-row {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 24px;
        padding-bottom: 24px;
        border-bottom: 1px solid var(--pln-card-border, #e4e4e7);
      }
      .avatar {
        width: 56px;
        height: 56px;
        border-radius: 14px;
        background: linear-gradient(135deg, #1d4ed8, #3b82f6);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.375rem;
        font-weight: 700;
        color: #fff;
        flex-shrink: 0;
      }
      .avatar-info {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .avatar-name {
        font-size: 1rem;
        font-weight: 700;
        color: var(--pln-text-1, #18181b);
      }
      .avatar-email {
        font-size: 0.875rem;
        color: var(--pln-text-3, #71717a);
      }

      .field-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .field__label {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--pln-text-3, #71717a);
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      .field__value {
        font-size: 0.9375rem;
        font-weight: 500;
        color: var(--pln-text-1, #18181b);
      }
      .field__value--with-badge {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .verified-badge {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 2px 8px;
        border-radius: 20px;
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        color: #059669;
        font-size: 0.6875rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .verified-badge__icon {
        font-size: 12px;
        width: 12px;
        height: 12px;
      }
      .unverified-badge {
        display: inline-flex;
        align-items: center;
        padding: 2px 8px;
        border-radius: 20px;
        background: #fef9c3;
        border: 1px solid #fde047;
        color: #a16207;
        font-size: 0.6875rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .providers-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding-top: 2px;
      }
      .provider-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 0.8125rem;
        font-weight: 600;
        border: 1px solid;
      }
      .provider-chip--google {
        background: #f8fbff;
        border-color: #dbeafe;
        color: var(--pln-text-1, #18181b);
      }
      .provider-chip--email {
        background: #eff6ff;
        border-color: #bfdbfe;
        color: var(--pln-text-1, #18181b);
      }
      .provider-chip__icon {
        width: 16px;
        height: 16px;
      }
      .provider-chip__icon--mat {
        font-size: 16px;
        color: #2563eb;
      }

      .coming-soon-note {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.8125rem;
        color: var(--pln-text-3, #71717a);
      }
      .coming-soon-note__icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: #2563eb;
      }
      .coming-soon-chip {
        display: inline-flex;
        padding: 4px 12px;
        border-radius: 20px;
        background: rgba(37, 99, 235, 0.08);
        border: 1px solid rgba(37, 99, 235, 0.2);
        color: #2563eb;
        font-size: 0.75rem;
        font-weight: 600;
      }

      .security-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .security-row__info {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .security-row__label {
        font-size: 0.9375rem;
        font-weight: 600;
        color: var(--pln-text-1, #18181b);
      }
      .security-row__desc {
        font-size: 0.8125rem;
        color: var(--pln-text-3, #71717a);
      }

      .security-notice {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
        background: #f8faff;
        border: 1px solid #dbeafe;
        border-radius: 10px;
      }
      .security-notice__icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #2563eb;
        flex-shrink: 0;
        margin-top: 1px;
      }
      .security-notice__title {
        margin: 0 0 4px;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--pln-text-1, #18181b);
      }
      .security-notice__desc {
        margin: 0;
        font-size: 0.8125rem;
        color: var(--pln-text-3, #71717a);
        line-height: 1.55;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  private readonly authService = inject(AuthService);
  readonly user = toSignal(this.authService.user$);
  readonly hasCredentials = () => this.user()?.providers.includes('credentials') ?? false;
}
