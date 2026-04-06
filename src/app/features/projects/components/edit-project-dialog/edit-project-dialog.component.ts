import { Component, ChangeDetectionStrategy, inject, Inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InputFieldComponent } from '../../../../shared/ui/input-field/input-field.component';
import { ProjectsStore } from '../../data-access/projects.store';
import { Project, ProjectStatus } from '../../models/project.models';

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

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

@Component({
  selector: 'app-edit-project-dialog',
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
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <h2 class="dialog-title">Edit project</h2>
          <p class="dialog-sub">
            Update the details for <strong>{{ project.name }}</strong
            >.
          </p>
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

        <!-- Status -->
        <div class="status-field">
          <p class="field-label">Status</p>
          <div class="status-options">
            @for (s of statuses; track s.value) {
              <button
                type="button"
                class="status-chip"
                [class.status-chip--active]="selectedStatus() === s.value"
                (click)="selectedStatus.set(s.value)"
              >
                {{ s.label }}
              </button>
            }
          </div>
        </div>

        <!-- Color picker -->
        <div class="color-field">
          <p class="field-label">Color</p>
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
            {{ saveError() }}
          </div>
        }

        <div class="dialog-actions">
          <button type="button" mat-stroked-button (click)="dialogRef.close()">Cancel</button>
          <button type="submit" mat-flat-button [disabled]="saving()">
            @if (saving()) {
              <mat-spinner diameter="18" />
            } @else {
              Save changes
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

      .field-label {
        margin: 0 0 8px;
        font-size: 0.6875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        color: var(--mat-sys-on-surface-variant);
      }

      .status-options {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }

      .status-chip {
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 0.8125rem;
        font-weight: 500;
        border: 1.5px solid var(--mat-sys-outline-variant);
        background: transparent;
        color: var(--mat-sys-on-surface-variant);
        cursor: pointer;
        transition: all 0.15s;

        &:hover {
          border-color: var(--mat-sys-primary);
          color: var(--mat-sys-primary);
        }

        &--active {
          border-color: var(--mat-sys-primary);
          background: color-mix(in srgb, var(--mat-sys-primary) 10%, transparent);
          color: var(--mat-sys-primary);
          font-weight: 600;
        }
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
export class EditProjectDialogComponent {
  readonly dialogRef = inject(MatDialogRef<EditProjectDialogComponent>);
  private readonly store = inject(ProjectsStore);
  private readonly fb = inject(FormBuilder);
  readonly project: Project = inject(MAT_DIALOG_DATA);

  readonly colors = PROJECT_COLORS;
  readonly statuses = STATUS_OPTIONS;
  readonly selectedColor = signal(this.project.color ?? PROJECT_COLORS[0].value);
  readonly selectedStatus = signal<ProjectStatus>(this.project.status);
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);

  readonly form = this.fb.group({
    name: this.fb.nonNullable.control(this.project.name, [
      Validators.required,
      Validators.maxLength(100),
    ]),
    description: this.fb.nonNullable.control(this.project.description ?? ''),
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

    this.saving.set(true);
    this.saveError.set(null);

    this.store
      .update(this.project.id, {
        name: this.nameCtrl.value.trim(),
        description: this.descCtrl.value.trim() || undefined,
        color: this.selectedColor(),
        status: this.selectedStatus(),
      })
      .subscribe({
        next: (updated) => this.dialogRef.close(updated),
        error: () => {
          this.saveError.set(this.store['_state$'].value.saveError);
          this.saving.set(false);
        },
      });
  }
}
