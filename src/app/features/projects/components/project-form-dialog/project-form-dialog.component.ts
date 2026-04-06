import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InputFieldComponent } from '../../../../shared/ui/input-field/input-field.component';
import { ProjectsStore } from '../../data-access/projects.store';
import { CreateProjectRequest } from '../../models/project.models';

const PROJECT_COLORS = [
  { value: '#6d28d9', label: 'Violet' },
  { value: '#2563eb', label: 'Blue' },
  { value: '#0891b2', label: 'Cyan' },
  { value: '#16a34a', label: 'Green' },
  { value: '#ca8a04', label: 'Yellow' },
  { value: '#ea580c', label: 'Orange' },
  { value: '#dc2626', label: 'Red' },
  { value: '#db2777', label: 'Pink' },
];

@Component({
  selector: 'app-project-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    InputFieldComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dialog-shell dialog-enter">
      <div class="dialog-header">
        <div class="dialog-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div>
          <h2 class="dialog-title">New project</h2>
          <p class="dialog-sub">Fill in the details to create your project.</p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="dialog-body">
        <tw-input-field
          label="Project name"
          placeholder="e.g. Website redesign"
          [control]="nameCtrl"
        >
          @if (nameCtrl.touched && nameCtrl.hasError('required')) {
            <p class="text-xs text-rose-500 mt-0.5">Name is required.</p>
          }
          @if (nameCtrl.touched && nameCtrl.hasError('maxlength')) {
            <p class="text-xs text-rose-500 mt-0.5">Max 100 characters.</p>
          }
        </tw-input-field>

        <tw-input-field
          label="Description"
          placeholder="What is this project about? (optional)"
          [control]="descCtrl"
        />

        <!-- Color picker -->
        <div class="color-field">
          <p class="color-field__label">Color</p>
          <div class="color-swatches">
            @for (c of colors; track c.value) {
              <button
                type="button"
                class="color-swatch"
                [style.background]="c.value"
                [class.color-swatch--active]="selectedColor() === c.value"
                [attr.aria-label]="c.label"
                (click)="selectedColor.set(c.value)"
              ></button>
            }
          </div>
        </div>

        @if (saveError()) {
          <div
            class="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              class="shrink-0"
            >
              <path
                d="M8 5v4m0 2.5h.01M2 13h12L8 2 2 13z"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {{ saveError() }}
          </div>
        }

        <div class="dialog-actions">
          <button type="button" mat-stroked-button (click)="dialogRef.close()">Cancel</button>
          <button type="submit" mat-flat-button [disabled]="saving()">
            @if (saving()) {
              <mat-spinner diameter="18" />
            } @else {
              Create project
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .dialog-shell {
        width: 480px;
        max-width: 100%;
      }

      .dialog-header {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 24px 24px 0;
      }

      .dialog-icon {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: rgba(37, 99, 235, 0.1);
        color: #2563eb;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .dialog-title {
        margin: 0 0 4px;
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--mat-sys-on-surface);
        letter-spacing: -0.02em;
      }

      .dialog-sub {
        margin: 0;
        font-size: 0.8125rem;
        color: var(--mat-sys-on-surface-variant);
      }

      .dialog-body {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 20px 24px 24px;
      }

      .color-field__label {
        margin: 0 0 8px;
        font-size: 0.6875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        color: var(--mat-sys-on-surface-variant);
      }

      .color-swatches {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .color-swatch {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid transparent;
        cursor: pointer;
        transition:
          transform 0.15s,
          border-color 0.15s;
        outline: none;

        &:hover {
          transform: scale(1.15);
        }
        &--active {
          border-color: var(--mat-sys-on-surface);
          transform: scale(1.15);
        }
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding-top: 4px;
      }
    `,
  ],
})
export class ProjectFormDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ProjectFormDialogComponent>);
  private readonly store = inject(ProjectsStore);
  private readonly fb = inject(FormBuilder);

  readonly colors = PROJECT_COLORS;
  readonly selectedColor = signal(PROJECT_COLORS[0].value);
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);

  readonly form = this.fb.group({
    name: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(100)]),
    description: this.fb.nonNullable.control(''),
  });

  get nameCtrl() {
    return this.form.controls.name;
  }
  get descCtrl() {
    return this.form.controls.description;
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving()) return;

    const data: CreateProjectRequest = {
      name: this.nameCtrl.value.trim(),
      description: this.descCtrl.value.trim() || undefined,
      color: this.selectedColor(),
    };

    this.saving.set(true);
    this.saveError.set(null);

    this.store.create(data).subscribe({
      next: (project) => this.dialogRef.close(project),
      error: () => {
        const err = this.store['_state$'].value.saveError;
        this.saveError.set(err);
        this.saving.set(false);
      },
    });
  }
}
