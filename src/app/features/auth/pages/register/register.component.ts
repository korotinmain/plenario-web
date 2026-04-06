import { Component, ChangeDetectionStrategy, inject, OnDestroy, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  FormControl,
  AbstractControl,
  ValidatorFn,
} from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InputFieldComponent } from '../../../../shared/ui/input-field/input-field.component';
import { PasswordFieldComponent } from '../../../../shared/ui/password-field/password-field.component';
import { AuthStore } from '../../data-access/auth.store';
import { AuthApiService } from '../../data-access/auth-api.service';

interface RegisterForm {
  name: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}

function passwordsMatchValidator(): ValidatorFn {
  return (group: AbstractControl) => {
    const pw = group.get('password')?.value ?? '';
    const confirm = group.get('confirmPassword')?.value ?? '';
    return pw && confirm && pw !== confirm ? { passwordsMismatch: true } : null;
  };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    InputFieldComponent,
    PasswordFieldComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authStore = inject(AuthStore);
  private readonly authApiService = inject(AuthApiService);

  readonly form: FormGroup<RegisterForm> = this.fb.group(
    {
      name: this.fb.nonNullable.control(''),
      email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
      password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
      confirmPassword: this.fb.nonNullable.control('', [Validators.required]),
    },
    { validators: passwordsMatchValidator() },
  ) as FormGroup<RegisterForm>;

  get nameCtrl() {
    return this.form.controls.name;
  }
  get emailCtrl() {
    return this.form.controls.email;
  }
  get passwordCtrl() {
    return this.form.controls.password;
  }
  get confirmCtrl() {
    return this.form.controls.confirmPassword;
  }

  readonly loading = toSignal(this.authStore.state$.pipe(map((s) => s.registerLoading)), {
    initialValue: false,
  });
  readonly error = toSignal(this.authStore.state$.pipe(map((s) => s.registerError)), {
    initialValue: null,
  });
  readonly success = toSignal(this.authStore.state$.pipe(map((s) => s.registerSuccess)), {
    initialValue: false,
  });

  readonly passwordValue = toSignal(this.form.controls.password.valueChanges, { initialValue: '' });

  readonly passwordStrength = computed(() => {
    const pw = this.passwordValue();
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  });

  readonly strengthLabel = computed(() => {
    const s = this.passwordStrength();
    if (!this.passwordValue()) return '';
    if (s <= 1) return 'Weak';
    if (s === 2) return 'Fair';
    if (s === 3) return 'Good';
    return 'Strong';
  });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading()) return;
    const { name, email, password } = this.form.getRawValue();
    this.authStore.register({ email, password, name: name || undefined }).subscribe();
  }

  signUpWithGoogle(): void {
    this.authApiService.googleLogin();
  }

  ngOnDestroy(): void {
    this.authStore.resetRegisterState();
  }
}
