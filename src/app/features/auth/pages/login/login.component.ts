import { Component, ChangeDetectionStrategy, inject, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InputFieldComponent } from '../../../../shared/ui/input-field/input-field.component';
import { PasswordFieldComponent } from '../../../../shared/ui/password-field/password-field.component';
import { AuthStore } from '../../data-access/auth.store';
import { AuthApiService } from '../../data-access/auth-api.service';

interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    InputFieldComponent,
    PasswordFieldComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authStore = inject(AuthStore);
  private readonly authApiService = inject(AuthApiService);

  readonly form: FormGroup<LoginForm> = this.fb.group({
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    password: this.fb.nonNullable.control('', [Validators.required]),
  }) as FormGroup<LoginForm>;

  get emailCtrl() {
    return this.form.controls.email;
  }
  get passwordCtrl() {
    return this.form.controls.password;
  }

  readonly loading = toSignal(this.authStore.state$.pipe(map((s) => s.loginLoading)), {
    initialValue: false,
  });
  readonly error = toSignal(this.authStore.state$.pipe(map((s) => s.loginError)), {
    initialValue: null,
  });
  readonly errorType = toSignal(this.authStore.state$.pipe(map((s) => s.loginErrorType)), {
    initialValue: null,
  });
  readonly unverifiedEmail = toSignal(this.authStore.state$.pipe(map((s) => s.unverifiedEmail)), {
    initialValue: null,
  });
  readonly resendLoading = toSignal(this.authStore.state$.pipe(map((s) => s.resendLoading)), {
    initialValue: false,
  });
  readonly resendSuccess = toSignal(this.authStore.state$.pipe(map((s) => s.resendSuccess)), {
    initialValue: false,
  });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading()) return;

    const { email, password } = this.form.getRawValue();
    this.authStore.login({ email, password }).subscribe();
  }

  resendConfirmation(): void {
    const email = this.unverifiedEmail();
    if (!email || this.resendLoading()) return;
    this.authStore.resendConfirmation(email).subscribe();
  }

  loginWithGoogle(): void {
    this.authApiService.googleLogin();
  }

  ngOnDestroy(): void {
    this.authStore.resetLoginState();
  }
}
