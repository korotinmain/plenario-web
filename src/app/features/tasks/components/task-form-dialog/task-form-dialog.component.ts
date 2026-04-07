import {
  Component,
  ChangeDetectionStrategy,
  inject,
  Inject,
  signal,
  computed,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgClass } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
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
  defaultProjectId?: string;
  defaultDueDate?: string;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'TODO', label: 'To do' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'DONE', label: 'Done' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

@Component({
  selector: 'app-task-form-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, MatDialogModule, InputFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-full">
      <!-- ── Header ─────────────────────────────────────────────────────── -->
      <div class="flex items-start gap-4 px-6 pt-6">
        <!-- Icon -->
        <div
          class="w-10 h-10 rounded-xl bg-[#4c68c0]/10 text-[#4c68c0] flex items-center justify-center shrink-0"
        >
          @if (isEdit) {
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              />
              <path
                d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              />
            </svg>
          } @else {
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          }
        </div>

        <!-- Title + subtitle -->
        <div class="flex-1 min-w-0">
          <h2 class="text-[1.125rem] font-bold text-slate-900 tracking-tight leading-snug">
            {{ isEdit ? 'Edit task' : 'New task' }}
          </h2>
          <p class="text-sm text-slate-400 mt-0.5">
            {{ isEdit ? 'Update the details below.' : 'Fill in the details to create a task.' }}
          </p>
        </div>

        <!-- Close button -->
        <button
          type="button"
          (click)="dialogRef.close()"
          class="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors -mt-0.5 -mr-1"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <div class="h-px bg-slate-100 mt-5"></div>

      <!-- ── Form body ──────────────────────────────────────────────────── -->
      <form [formGroup]="form" (ngSubmit)="submit()" class="px-6 py-5 flex flex-col gap-5">

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
          placeholder="Optional notes or context…"
          [control]="descCtrl"
          [rows]="3"
        />

        <div class="h-px bg-slate-100 -mx-6"></div>

        <!-- Status + Priority -->
        <div class="grid grid-cols-2 gap-5">
          <!-- Status -->
          <div>
            <p class="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-slate-500 mb-2.5">
              Status
            </p>
            <div class="flex flex-col gap-1.5">
              @for (s of statuses; track s.value) {
                <button
                  type="button"
                  (click)="selectedStatus.set(s.value)"
                  class="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all text-left"
                  [ngClass]="statusChipClass(s.value)"
                >
                  <span class="w-2 h-2 rounded-full shrink-0" [ngClass]="statusDotClass(s.value)"></span>
                  {{ s.label }}
                </button>
              }
            </div>
          </div>

          <!-- Priority -->
          <div>
            <p class="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-slate-500 mb-2.5">
              Priority
            </p>
            <div class="flex flex-col gap-1.5">
              @for (p of priorities; track p.value) {
                <button
                  type="button"
                  (click)="selectedPriority.set(p.value)"
                  class="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all text-left"
                  [ngClass]="priorityChipClass(p.value)"
                >
                  <span class="w-2 h-2 rounded-full shrink-0" [ngClass]="priorityDotClass(p.value)"></span>
                  {{ p.label }}
                </button>
              }
            </div>
          </div>
        </div>

        <div class="h-px bg-slate-100 -mx-6"></div>

        <!-- Due date + Project -->
        <div class="grid grid-cols-2 gap-5">
          <!-- Due date -->
          <div>
            <label
              for="task-due"
              class="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-slate-500 block mb-2"
            >
              Due date
            </label>
            <input
              id="task-due"
              type="date"
              formControlName="dueDate"
              class="w-full bg-slate-100 border border-transparent rounded-2xl px-4 py-[13px] text-[0.9375rem] font-medium text-slate-900 outline-none focus:bg-white focus:border-[#4c68c0] focus:ring-0 transition-all"
            />
          </div>

          <!-- Project -->
          <div>
            <label
              for="task-project"
              class="text-[0.6875rem] font-semibold uppercase tracking-[0.07em] text-slate-500 block mb-2"
            >
              Project
            </label>
            <div class="relative">
              <select
                id="task-project"
                formControlName="projectId"
                class="w-full appearance-none bg-slate-100 border border-transparent rounded-2xl pl-4 pr-10 py-[13px] text-[0.9375rem] font-medium text-slate-900 outline-none focus:bg-white focus:border-[#4c68c0] focus:ring-0 transition-all cursor-pointer"
              >
                <option value="">No project</option>
                @for (p of projects(); track p.id) {
                  <option [value]="p.id">{{ p.name }}</option>
                }
              </select>
              <!-- Chevron -->
              <div class="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-400">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Error banner -->
        @if (saveError()) {
          <div class="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true" class="shrink-0">
              <path d="M8 5v4m0 2.5h.01M2 13h12L8 2 2 13z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            {{ saveError() }}
          </div>
        }

        <!-- Actions -->
        <div class="flex justify-end gap-2.5 pt-1">
          <button
            type="button"
            (click)="dialogRef.close()"
            class="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="saving()"
            class="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#4c68c0] hover:bg-[#3d58af] disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            @if (saving()) {
              <span class="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
            }
            {{ isEdit ? 'Save changes' : 'Create task' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [':host { display: block; }'],
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
    dueDate: this.fb.control<string | null>(
      this.task?.dueDate?.slice(0, 10) ?? this.defaultDueDate ?? null,
    ),
    // Native select uses empty string for "no project"
    projectId: this.fb.nonNullable.control(
      this.task?.projectId ?? this.defaultProjectId ?? '',
    ),
  });

  get titleCtrl() { return this.form.controls.title; }
  get descCtrl()  { return this.form.controls.description; }

  // ── Chip classes ────────────────────────────────────────────────────────────
  statusChipClass(value: TaskStatus): string {
    if (this.selectedStatus() !== value) {
      return 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50';
    }
    return {
      TODO:        'border-slate-400 bg-slate-100 text-slate-700',
      IN_PROGRESS: 'border-[#4c68c0] bg-[#4c68c0]/10 text-[#4c68c0]',
      DONE:        'border-emerald-500 bg-emerald-50 text-emerald-700',
    }[value];
  }

  statusDotClass(value: TaskStatus): string {
    if (this.selectedStatus() !== value) return 'bg-slate-300';
    return { TODO: 'bg-slate-500', IN_PROGRESS: 'bg-[#4c68c0]', DONE: 'bg-emerald-500' }[value];
  }

  priorityChipClass(value: TaskPriority): string {
    if (this.selectedPriority() !== value) {
      return 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50';
    }
    return {
      LOW:    'border-sky-400 bg-sky-50 text-sky-700',
      MEDIUM: 'border-amber-400 bg-amber-50 text-amber-700',
      HIGH:   'border-red-400 bg-red-50 text-red-600',
    }[value];
  }

  priorityDotClass(value: TaskPriority): string {
    if (this.selectedPriority() !== value) return 'bg-slate-300';
    return { LOW: 'bg-sky-400', MEDIUM: 'bg-amber-400', HIGH: 'bg-red-400' }[value];
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving()) return;

    this.saving.set(true);
    this.saveError.set(null);

    const dueDate  = this.form.controls.dueDate.value ?? undefined;
    const projectId = this.form.controls.projectId.value || undefined; // '' → undefined

    if (this.isEdit && this.task) {
      const data: UpdateTaskRequest = {
        title:       this.titleCtrl.value.trim(),
        description: this.descCtrl.value.trim() || undefined,
        status:      this.selectedStatus(),
        priority:    this.selectedPriority(),
        dueDate:     dueDate ?? null,
        projectId:   projectId ?? null,
      };
      this.tasksStore.update(this.task.id, data).subscribe({
        next:  (updated) => this.dialogRef.close(updated),
        error: () => {
          this.saveError.set(this.tasksStore['_state$'].value.saveError);
          this.saving.set(false);
        },
      });
    } else {
      const data: CreateTaskRequest = {
        title:       this.titleCtrl.value.trim(),
        description: this.descCtrl.value.trim() || undefined,
        status:      this.selectedStatus(),
        priority:    this.selectedPriority(),
        dueDate,
        projectId,
      };
      this.tasksStore.create(data).subscribe({
        next:  (created) => this.dialogRef.close(created),
        error: () => {
          this.saveError.set(this.tasksStore['_state$'].value.saveError);
          this.saving.set(false);
        },
      });
    }
  }
}

