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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { PasswordFieldComponent } from '../../../../shared/ui/password-field/password-field.component';
import { AuthStore } from '../../data-access/auth.store';

interface RegisterForm {
  name: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    PasswordFieldComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authStore = inject(AuthStore);

  readonly form: FormGroup<RegisterForm> = this.fb.group({
    name: this.fb.nonNullable.control(''),
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
  }) as FormGroup<RegisterForm>;

  get nameCtrl() {
    return this.form.controls.name;
  }
  get emailCtrl() {
    return this.form.controls.email;
  }
  get passwordCtrl() {
    return this.form.controls.password;
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

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading()) return;

    const { name, email, password } = this.form.getRawValue();
    this.authStore.register({ email, password, name: name || undefined }).subscribe();
  }

  ngOnDestroy(): void {
    this.authStore.resetRegisterState();
  }
}
