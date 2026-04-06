import {
  Component,
  ChangeDetectionStrategy,
  inject,
  Inject,
  signal,
  computed,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { InputFieldComponent } from '../../../../shared/ui/input-field/input-field.component';
import { TasksStore } from '../../data-access/tasks.store';
import { ProjectsStore } from '../../../projects/data-access/projects.store';
import {
  Task,
  TaskStatus,
  TaskPriority,
  CreateTaskRequest,
  UpdateTaskRequest,
} from '../../models/task.models';

export interface TaskFormDialogData {
  task?: Task;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string; icon: string }[] = [
  { value: 'TODO', label: 'To do', icon: 'radio_button_unchecked' },
  { value: 'IN_PROGRESS', label: 'In progress', icon: 'timelapse' },
  { value: 'DONE', label: 'Done', icon: 'check_circle' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

@Component({
  selector: 'app-task-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    InputFieldComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dialog-shell dialog-enter">
      <div class="dialog-header">
        <div class="dialog-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            @if (isEdit) {
              <path
                d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            } @else {
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            }
          </svg>
        </div>
        <div>
          <h2 class="dialog-title">{{ isEdit ? 'Edit task' : 'New task' }}</h2>
          <p class="dialog-sub">
            {{ isEdit ? 'Update the task details.' : 'Add a task to your list.' }}
          </p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="dialog-body">
        <!-- Title -->
        <tw-input-field
          label="Task title"
          placeholder="e.g. Write project brief"
          [control]="titleCtrl"
        >
          @if (titleCtrl.touched && titleCtrl.hasError('required')) {
            <p class="text-xs text-rose-500 mt-0.5">Title is required.</p>
          }
          @if (titleCtrl.touched && titleCtrl.hasError('maxlength')) {
            <p class="text-xs text-rose-500 mt-0.5">Max 200 characters.</p>
          }
        </tw-input-field>

        <!-- Description -->
        <tw-input-field
          label="Description"
          placeholder="Optional notes or context"
          [control]="descCtrl"
        />

        <!-- Status + Priority row -->
        <div class="row-fields">
          <div class="chip-field">
            <p class="chip-field__label">Status</p>
            <div class="chip-group">
              @for (s of statuses; track s.value) {
                <button
                  type="button"
                  class="status-chip"
                  [class.status-chip--active]="selectedStatus() === s.value"
                  [class]="'status-chip--' + s.value.toLowerCase()"
                  (click)="selectedStatus.set(s.value)"
                >
                  {{ s.label }}
                </button>
              }
            </div>
          </div>

          <div class="chip-field">
            <p class="chip-field__label">Priority</p>
            <div class="chip-group">
              @for (p of priorities; track p.value) {
                <button
                  type="button"
                  class="priority-chip"
                  [class.priority-chip--active]="selectedPriority() === p.value"
                  [class]="
                    'priority-chip--' +
                    p.value.toLowerCase() +
                    (selectedPriority() === p.value ? ' priority-chip--active' : '')
                  "
                  (click)="selectedPriority.set(p.value)"
                >
                  {{ p.label }}
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Due date + Project row -->
        <div class="row-fields">
          <div class="date-field">
            <label class="field-label" for="task-due-date">Due date</label>
            <input id="task-due-date" type="date" class="date-input" formControlName="dueDate" />
          </div>

          <div class="select-field">
            <label class="field-label">Project</label>
            <mat-form-field appearance="outline" class="project-select">
              <mat-select formControlName="projectId" placeholder="No project">
                <mat-option [value]="null">No project</mat-option>
                @for (p of projects(); track p.id) {
                  <mat-option [value]="p.id">
                    <span class="project-option">
                      <span class="project-dot" [style.background]="p.color ?? '#2563eb'"></span>
                      {{ p.name }}
                    </span>
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
        </div>

        @if (saveError()) {
          <div class="error-row">
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
              {{ isEdit ? 'Save changes' : 'Create task' }}
            }
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .dialog-shell {
        width: 520px;
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
        gap: 18px;
        padding: 20px 24px 24px;
      }

      .row-fields {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .chip-field__label,
      .field-label {
        display: block;
        margin: 0 0 6px;
        font-size: 0.6875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        color: var(--mat-sys-on-surface-variant);
      }

      .chip-group {
        display: flex;
        gap: 5px;
        flex-wrap: wrap;
      }

      // ── Status chips ────────────────────────────────────────────────────────
      .status-chip {
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 500;
        border: 1.5px solid var(--mat-sys-outline-variant);
        background: transparent;
        color: var(--mat-sys-on-surface-variant);
        cursor: pointer;
        transition: all 0.14s;

        &:hover {
          border-color: var(--mat-sys-primary);
          color: var(--mat-sys-primary);
        }

        &--active,
        &.status-chip--todo.status-chip--active {
          border-color: #71717a;
          background: #f4f4f5;
          color: #3f3f46;
          font-weight: 600;
        }

        &.status-chip--in_progress.status-chip--active {
          border-color: #2563eb;
          background: rgba(37, 99, 235, 0.08);
          color: #2563eb;
          font-weight: 600;
        }

        &.status-chip--done.status-chip--active {
          border-color: #059669;
          background: rgba(5, 150, 105, 0.08);
          color: #059669;
          font-weight: 600;
        }
      }

      // ── Priority chips ──────────────────────────────────────────────────────
      .priority-chip {
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 500;
        border: 1.5px solid var(--mat-sys-outline-variant);
        background: transparent;
        color: var(--mat-sys-on-surface-variant);
        cursor: pointer;
        transition: all 0.14s;

        &:hover {
          border-color: var(--mat-sys-primary);
          color: var(--mat-sys-primary);
        }

        &.priority-chip--low.priority-chip--active {
          border-color: #0284c7;
          background: rgba(2, 132, 199, 0.08);
          color: #0284c7;
          font-weight: 600;
        }

        &.priority-chip--medium.priority-chip--active {
          border-color: #d97706;
          background: rgba(217, 119, 6, 0.08);
          color: #d97706;
          font-weight: 600;
        }

        &.priority-chip--high.priority-chip--active {
          border-color: #dc2626;
          background: rgba(220, 38, 38, 0.08);
          color: #dc2626;
          font-weight: 600;
        }
      }

      // ── Date input ──────────────────────────────────────────────────────────
      .date-input {
        display: block;
        width: 100%;
        padding: 9px 12px;
        border: 1.5px solid var(--mat-sys-outline-variant);
        border-radius: 10px;
        font-size: 0.875rem;
        font-family: inherit;
        color: var(--mat-sys-on-surface);
        background: transparent;
        outline: none;
        transition: border-color 0.15s;
        box-sizing: border-box;

        &:focus {
          border-color: var(--mat-sys-primary);
        }
      }

      // ── Project select ──────────────────────────────────────────────────────
      .project-select {
        width: 100%;

        .mat-mdc-form-field-subscript-wrapper {
          display: none;
        }
      }

      .project-option {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .project-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      .select-field .field-label {
        margin-bottom: 2px;
      }

      // ── Error row ───────────────────────────────────────────────────────────
      .error-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 14px;
        border-radius: 10px;
        background: #fff1f2;
        border: 1px solid #fecdd3;
        color: #be123c;
        font-size: 0.8125rem;
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
export class TaskFormDialogComponent {
  readonly dialogRef = inject(MatDialogRef<TaskFormDialogComponent>);
  private readonly tasksStore = inject(TasksStore);
  private readonly projectsStore = inject(ProjectsStore);
  private readonly fb = inject(FormBuilder);

  readonly task: Task | undefined = inject(MAT_DIALOG_DATA)?.task;
  readonly defaultProjectId: string | undefined = inject(MAT_DIALOG_DATA)?.defaultProjectId;
  readonly defaultDueDate: string | undefined = inject(MAT_DIALOG_DATA)?.defaultDueDate;
  readonly isEdit = !!this.task;

  readonly statuses = STATUS_OPTIONS;
  readonly priorities = PRIORITY_OPTIONS;

  readonly projects = toSignal(this.projectsStore.state$.pipe(map((s) => s.projects)), {
    initialValue: [],
  });

  readonly selectedStatus = signal<TaskStatus>(this.task?.status ?? 'TODO');
  readonly selectedPriority = signal<TaskPriority>(this.task?.priority ?? 'MEDIUM');
  readonly saving = signal(false);
  readonly saveError = signal<string | null>(null);

  readonly form = this.fb.group({
    title: this.fb.nonNullable.control(this.task?.title ?? '', [
      Validators.required,
      Validators.maxLength(200),
    ]),
    description: this.fb.nonNullable.control(this.task?.description ?? ''),
    dueDate: this.fb.control<string | null>(this.task?.dueDate?.slice(0, 10) ?? this.defaultDueDate ?? null),
    projectId: this.fb.control<string | null>(
      this.task?.projectId ?? this.defaultProjectId ?? null,
    ),
  });

  get titleCtrl() {
    return this.form.controls.title;
  }
  get descCtrl() {
    return this.form.controls.description;
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving()) return;

    this.saving.set(true);
    this.saveError.set(null);

    const dueDate = this.form.controls.dueDate.value ?? undefined;
    const projectId = this.form.controls.projectId.value ?? undefined;

    if (this.isEdit && this.task) {
      const data: UpdateTaskRequest = {
        title: this.titleCtrl.value.trim(),
        description: this.descCtrl.value.trim() || undefined,
        status: this.selectedStatus(),
        priority: this.selectedPriority(),
        dueDate: dueDate ?? null,
        projectId: projectId ?? null,
      };
      this.tasksStore.update(this.task.id, data).subscribe({
        next: (updated) => this.dialogRef.close(updated),
        error: () => {
          this.saveError.set(this.tasksStore['_state$'].value.saveError);
          this.saving.set(false);
        },
      });
    } else {
      const data: CreateTaskRequest = {
        title: this.titleCtrl.value.trim(),
        description: this.descCtrl.value.trim() || undefined,
        status: this.selectedStatus(),
        priority: this.selectedPriority(),
        dueDate,
        projectId,
      };
      this.tasksStore.create(data).subscribe({
        next: (created) => this.dialogRef.close(created),
        error: () => {
          this.saveError.set(this.tasksStore['_state$'].value.saveError);
          this.saving.set(false);
        },
      });
    }
  }
}
