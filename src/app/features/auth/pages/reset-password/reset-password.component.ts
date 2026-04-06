import { Component, ChangeDetectionStrategy, inject, OnDestroy, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PasswordFieldComponent } from '../../../../shared/ui/password-field/password-field.component';
import { AuthStore } from '../../data-access/auth.store';

function passwordsMatchValidator(): ValidatorFn {
  return (group: AbstractControl) => {
    const pw = group.get('password')?.value ?? '';
    const confirm = group.get('confirmPassword')?.value ?? '';
    return pw && confirm && pw !== confirm ? { passwordsMismatch: true } : null;
  };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    PasswordFieldComponent,
  ],
  template: `
    <div class="auth-page">
      @if (!token()) {
        <div class="flex flex-col items-center gap-4 py-2" style="text-align:center">
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
            <h1 class="auth-title">Invalid reset link</h1>
            <p class="auth-subtitle">This link is missing or has expired. Request a new one.</p>
          </div>
        </div>
        <a mat-flat-button routerLink="/forgot-password" class="submit-btn">
          <span>Request new link</span>
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
      } @else if (success()) {
        <div class="flex flex-col items-center gap-4 py-2" style="text-align:center">
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
            <h2 class="auth-title">Password updated!</h2>
            <p class="auth-subtitle">
              Your password has been reset. Sign in with your new password.
            </p>
          </div>
        </div>
        <a mat-flat-button routerLink="/login" class="submit-btn">
          <span>Sign in now</span>
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
      } @else {
        <div class="auth-badge">
          <span class="auth-badge__dot"></span>
          Reset password
        </div>

        <div class="auth-header">
          <h1 class="auth-title">Set a new password</h1>
          <p class="auth-subtitle">Create a strong password for your account.</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="auth-form">
          <app-password-field
            [control]="passwordCtrl"
            label="New password"
            placeholder="Minimum 8 characters"
            autocomplete="new-password"
          >
            @if (passwordCtrl.hasError('required') && passwordCtrl.touched) {
              <p class="text-xs text-rose-500 mt-0.5">Password is required</p>
            } @else if (passwordCtrl.hasError('minlength') && passwordCtrl.touched) {
              <p class="text-xs text-rose-500 mt-0.5">Password must be at least 8 characters</p>
            }
          </app-password-field>

          <app-password-field
            [control]="confirmCtrl"
            label="Confirm password"
            autocomplete="new-password"
          >
            @if (form.hasError('passwordsMismatch') && confirmCtrl.touched) {
              <p class="text-xs text-rose-500 mt-0.5">Passwords do not match</p>
            }
          </app-password-field>

          @if (error()) {
            <div
              class="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700"
              role="alert"
            >
              <svg
                class="shrink-0"
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                  clip-rule="evenodd"
                />
              </svg>
              <span>{{ error() }}</span>
            </div>
          }

          <button mat-flat-button type="submit" class="submit-btn" [disabled]="loading()">
            @if (loading()) {
              <mat-spinner diameter="18" />
              <span>Updating…</span>
            } @else {
              <span>Update password</span>
              <svg class="btn-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  stroke-width="1.75"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            }
          </button>
        </form>

        <div class="auth-footer">
          <span class="auth-footer__text">Remember your password?</span>
          <a routerLink="/login" class="auth-footer__link">Sign in</a>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly authStore = inject(AuthStore);

  readonly token = signal(this.route.snapshot.queryParamMap.get('token') ?? '');

  readonly form = this.fb.group(
    {
      password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: this.fb.nonNullable.control('', [Validators.required]),
    },
    { validators: passwordsMatchValidator() },
  );

  get passwordCtrl() {
    return this.form.controls.password;
  }
  get confirmCtrl() {
    return this.form.controls.confirmPassword;
  }

  readonly loading = toSignal(this.authStore.state$.pipe(map((s) => s.resetPasswordLoading)), {
    initialValue: false,
  });
  readonly error = toSignal(this.authStore.state$.pipe(map((s) => s.resetPasswordError)), {
    initialValue: null,
  });
  readonly success = toSignal(this.authStore.state$.pipe(map((s) => s.resetPasswordSuccess)), {
    initialValue: false,
  });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading()) return;
    const token = this.token();
    if (!token) return;
    this.authStore.resetPassword({ token, password: this.passwordCtrl.value }).subscribe();
  }

  ngOnDestroy(): void {
    this.authStore.resetResetPasswordState();
  }
}
