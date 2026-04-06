import { Component, ChangeDetectionStrategy, inject, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InputFieldComponent } from '../../../../shared/ui/input-field/input-field.component';
import { AuthStore } from '../../data-access/auth.store';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    InputFieldComponent,
  ],
  template: `
    <div class="auth-page">
      @if (success()) {
        <div class="flex flex-col items-center text-align-center gap-4 py-2">
          <div class="flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-50">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
                style="color: var(--mat-sys-primary)"
              />
            </svg>
          </div>
          <div class="auth-header" style="text-align:center">
            <h1 class="auth-title">Check your inbox</h1>
            <p class="auth-subtitle">
              If an account exists for <strong class="email-highlight">{{ emailCtrl.value }}</strong
              >, we've sent a password reset link to that address.
            </p>
          </div>
          <p class="auth-hint">Didn't get it? Check your spam or try again.</p>
        </div>

        <a mat-stroked-button routerLink="/login" class="submit-btn">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" style="width:16px;height:16px">
            <path
              d="M13 8H3M7 4L3 8l4 4"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Back to sign in
        </a>
      } @else {
        <a routerLink="/login" class="page-back-link">
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M10 3L5 8l5 5"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Back to sign in
        </a>

        <div class="auth-badge">
          <span class="auth-badge__dot"></span>
          Forgot password
        </div>

        <div class="auth-header">
          <h1 class="auth-title">Reset your password</h1>
          <p class="auth-subtitle">Enter your email and we'll send you reset instructions.</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="auth-form">
          <tw-input-field
            label="Email address"
            type="email"
            [control]="emailCtrl"
            placeholder="you@example.com"
            autocomplete="email"
          >
            @if (emailCtrl.hasError('required') && emailCtrl.touched) {
              <p class="text-xs text-rose-500 mt-0.5">Email is required</p>
            } @else if (emailCtrl.hasError('email') && emailCtrl.touched) {
              <p class="text-xs text-rose-500 mt-0.5">Enter a valid email address</p>
            }
          </tw-input-field>

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
              <span>Sending…</span>
            } @else {
              <span>Send reset link</span>
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
export class ForgotPasswordComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authStore = inject(AuthStore);

  readonly form = this.fb.group({
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
  });

  get emailCtrl() {
    return this.form.controls.email;
  }

  readonly loading = toSignal(this.authStore.state$.pipe(map((s) => s.forgotPasswordLoading)), {
    initialValue: false,
  });
  readonly error = toSignal(this.authStore.state$.pipe(map((s) => s.forgotPasswordError)), {
    initialValue: null,
  });
  readonly success = toSignal(this.authStore.state$.pipe(map((s) => s.forgotPasswordSuccess)), {
    initialValue: false,
  });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading()) return;
    this.authStore.forgotPassword({ email: this.emailCtrl.value }).subscribe();
  }

  ngOnDestroy(): void {
    this.authStore.resetForgotPasswordState();
  }
}
