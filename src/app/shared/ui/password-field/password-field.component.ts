import { Component, Input, forwardRef, ChangeDetectionStrategy, signal } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-password-field',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ],
  template: `
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>{{ label }}</mat-label>
      <input
        matInput
        [type]="visible() ? 'text' : 'password'"
        [formControl]="control"
        [placeholder]="placeholder"
        autocomplete="current-password"
      />
      <button
        mat-icon-button
        matSuffix
        type="button"
        [attr.aria-label]="visible() ? 'Hide password' : 'Show password'"
        (click)="toggleVisibility()"
      >
        <mat-icon>{{ visible() ? 'visibility_off' : 'visibility' }}</mat-icon>
      </button>
      @if (control.hasError('required') && control.touched) {
        <mat-error>{{ label }} is required</mat-error>
      } @else if (control.hasError('minlength') && control.touched) {
        <mat-error
          >Password must be at least
          {{ control.getError('minlength').requiredLength }} characters</mat-error
        >
      }
    </mat-form-field>
  `,
  styles: [
    `
      .full-width {
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PasswordFieldComponent),
      multi: true,
    },
  ],
})
export class PasswordFieldComponent implements ControlValueAccessor {
  @Input() label = 'Password';
  @Input() placeholder = '';
  @Input() control = new FormControl('');

  readonly visible = signal(false);

  toggleVisibility(): void {
    this.visible.update((v) => !v);
  }

  // ControlValueAccessor — forwarded through the inner FormControl input
  writeValue(): void {}
  registerOnChange(): void {}
  registerOnTouched(): void {}
}
