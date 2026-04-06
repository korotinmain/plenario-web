import { Component, Input, ChangeDetectionStrategy, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

/**
 * Tailwind-styled password input group with show/hide toggle.
 * Pass error messages via ng-content:
 *
 *   <app-password-field label="Password" [control]="passwordCtrl">
 *     @if (passwordCtrl.hasError('required') && passwordCtrl.touched) {
 *       <p class="text-xs text-rose-500 mt-0.5">Password is required</p>
 *     }
 *   </app-password-field>
 */
@Component({
  selector: 'app-password-field',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-1">
      <label
        [for]="id"
        class="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-slate-500 select-none"
      >
        {{ label }}
      </label>

      <div class="relative">
        <input
          [id]="id"
          [type]="visible() ? 'text' : 'password'"
          [formControl]="control"
          [placeholder]="placeholder"
          [autocomplete]="autocomplete"
          class="block w-full px-4 py-[15px] pr-12 rounded-2xl border text-[0.9375rem] font-medium text-slate-900 placeholder:text-slate-400/70 outline-none transition-all duration-200"
          [ngClass]="
            hasError
              ? 'bg-rose-50 border-rose-300 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              : 'bg-slate-100 border-transparent focus:bg-white focus:border-violet-600 focus:ring-2 focus:ring-violet-600/20'
          "
        />

        <!-- Show / hide toggle -->
        <button
          type="button"
          [attr.aria-label]="visible() ? 'Hide password' : 'Show password'"
          (click)="toggleVisibility()"
          class="absolute inset-y-0 right-0 flex items-center px-4
                 text-slate-400 hover:text-slate-600 transition-colors duration-150"
        >
          @if (visible()) {
            <!-- eye-off -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path
                d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"
              />
              <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
              <path d="m2.93 2.93 18.14 18.14" />
            </svg>
          } @else {
            <!-- eye -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          }
        </button>
      </div>

      <ng-content />
    </div>
  `,
  styles: [':host { display: block; }'],
})
export class PasswordFieldComponent {
  private static seq = 0;

  @Input({ required: true }) control!: FormControl;
  @Input() label = 'Password';
  @Input() placeholder = '';
  @Input() autocomplete = 'current-password';

  readonly id = `tw-password-${++PasswordFieldComponent.seq}`;
  readonly visible = signal(false);

  get hasError(): boolean {
    return !!(this.control?.invalid && this.control?.touched);
  }

  toggleVisibility(): void {
    this.visible.update((v) => !v);
  }
}
