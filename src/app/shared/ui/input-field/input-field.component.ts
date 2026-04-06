import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgClass } from '@angular/common';

/**
 * Tailwind-styled input group.
 * Pass error messages via ng-content:
 *
 *   <tw-input-field label="Email" type="email" [control]="emailCtrl">
 *     @if (emailCtrl.hasError('required') && emailCtrl.touched) {
 *       <p class="text-xs text-rose-500 mt-0.5">Required</p>
 *     }
 *   </tw-input-field>
 */
@Component({
  selector: 'tw-input-field',
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

      <input
        [id]="id"
        [type]="type"
        [formControl]="control"
        [placeholder]="placeholder"
        [autocomplete]="autocomplete"
        class="block w-full px-4 py-[15px] rounded-2xl border text-[0.9375rem] font-medium text-slate-900 placeholder:text-slate-400/70 outline-none transition-all duration-200"
        [ngClass]="
          hasError
            ? 'bg-rose-50 border-rose-300 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
            : 'bg-slate-100 border-transparent focus:bg-white focus:border-violet-600 focus:ring-2 focus:ring-violet-600/20'
        "
      />

      <ng-content />
    </div>
  `,
})
export class InputFieldComponent {
  private static seq = 0;

  @Input({ required: true }) control!: FormControl;
  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() autocomplete = 'off';

  readonly id = `tw-input-${++InputFieldComponent.seq}`;

  get hasError(): boolean {
    return !!(this.control?.invalid && this.control?.touched);
  }
}
