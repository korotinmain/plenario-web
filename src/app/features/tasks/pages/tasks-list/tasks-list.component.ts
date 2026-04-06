import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { TasksStore } from '../../data-access/tasks.store';
import { ProjectsStore } from '../../../projects/data-access/projects.store';
import { TaskFormDialogComponent } from '../../components/task-form-dialog/task-form-dialog.component';
import { DeleteTaskDialogComponent } from '../../components/delete-task-dialog/delete-task-dialog.component';
import { Task, TaskStatus, TaskPriority } from '../../models/task.models';

type StatusFilter = 'all' | TaskStatus;
type PriorityFilter = 'all' | TaskPriority;

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'To do',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    PageHeaderComponent,
    EmptyStateComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Tasks" subtitle="Plan, track, and complete your work">
      <button mat-flat-button (click)="openCreate()">
        <mat-icon>add</mat-icon>
        New task
      </button>
    </app-page-header>

    <!-- Filter bar -->
    <div class="filter-bar">
      <div class="filter-group">
        @for (f of statusFilters; track f.key) {
          <button
            class="filter-tab"
            [class.filter-tab--active]="activeStatus() === f.key"
            (click)="activeStatus.set(f.key)"
          >
            {{ f.label }}
            <span class="filter-tab__count">{{ countByStatus(f.key) }}</span>
          </button>
        }
      </div>
      <div class="filter-group filter-group--right">
        @for (p of priorityFilters; track p.key) {
          <button
            class="priority-filter"
            [class.priority-filter--active]="activePriority() === p.key"
            [class]="
              'priority-filter--' +
              p.key.toLowerCase() +
              (activePriority() === p.key ? ' priority-filter--active' : '')
            "
            (click)="activePriority.set(p.key)"
          >
            {{ p.label }}
          </button>
        }
      </div>
    </div>

    <!-- States -->
    @if (loading()) {
      <div class="task-list stagger-cards">
        @for (_ of [1, 2, 3, 4, 5]; track $index) {
          <div class="task-skeleton">
            <div
              class="skeleton"
              style="width:10px;height:10px;border-radius:50%;flex-shrink:0"
            ></div>
            <div style="flex:1;display:flex;flex-direction:column;gap:6px">
              <div class="skeleton skeleton-text" style="width:55%"></div>
              <div class="skeleton skeleton-text" style="width:35%"></div>
            </div>
            <div class="skeleton" style="width:70px;height:22px;border-radius:20px"></div>
            <div class="skeleton" style="width:56px;height:22px;border-radius:20px"></div>
          </div>
        }
      </div>
    } @else if (error()) {
      <div class="error-banner">
        <mat-icon class="error-banner__icon">warning_amber</mat-icon>
        <span>{{ error() }}</span>
        <button mat-stroked-button (click)="store.load()">Retry</button>
      </div>
    } @else if (allTasks().length === 0) {
      <app-empty-state
        icon="task_alt"
        title="No tasks yet"
        message="Create your first task to start tracking your work."
      >
        <button mat-flat-button (click)="openCreate()">
          <mat-icon>add</mat-icon>
          New task
        </button>
      </app-empty-state>
    } @else if (filteredTasks().length === 0) {
      <app-empty-state
        icon="filter_alt_off"
        title="No matching tasks"
        message="No tasks found for the selected filters."
      >
        <button mat-stroked-button (click)="clearFilters()">Clear filters</button>
      </app-empty-state>
    } @else {
      <div class="task-list">
        @for (task of filteredTasks(); track task.id) {
          <div class="task-row">
            <!-- Status indicator -->
            <button
              class="task-status-btn"
              [class]="'task-status-btn--' + task.status.toLowerCase()"
              [attr.aria-label]="'Status: ' + statusLabel(task.status)"
              (click)="cycleStatus(task)"
            >
              <mat-icon class="task-status-icon">
                {{
                  task.status === 'DONE'
                    ? 'check_circle'
                    : task.status === 'IN_PROGRESS'
                      ? 'timelapse'
                      : 'radio_button_unchecked'
                }}
              </mat-icon>
            </button>

            <!-- Content -->
            <div class="task-content" [class.task-content--done]="task.status === 'DONE'">
              <span class="task-title">{{ task.title }}</span>
              @if (task.description) {
                <span class="task-desc">{{ task.description }}</span>
              }
            </div>

            <!-- Meta -->
            <div class="task-meta">
              @if (task.dueDate) {
                <span class="task-due" [class.task-due--overdue]="isOverdue(task)">
                  <mat-icon class="task-due-icon">event</mat-icon>
                  {{ task.dueDate | date: 'MMM d' }}
                </span>
              }
              @if (projectName(task.projectId)) {
                <span class="task-project">
                  <span
                    class="task-project-dot"
                    [style.background]="projectColor(task.projectId)"
                  ></span>
                  {{ projectName(task.projectId) }}
                </span>
              }
            </div>

            <!-- Chips -->
            <span class="priority-chip" [class]="'priority-chip--' + task.priority.toLowerCase()">
              {{ priorityLabel(task.priority) }}
            </span>

            <!-- Menu -->
            <button
              mat-icon-button
              [matMenuTriggerFor]="menu"
              class="task-menu-btn"
              aria-label="Task options"
            >
              <mat-icon>more_vert</mat-icon>
            </button>
            <mat-menu #menu="matMenu">
              <button mat-menu-item (click)="openEdit(task)">
                <mat-icon>edit</mat-icon>
                <span>Edit</span>
              </button>
              <button mat-menu-item class="menu-delete" (click)="openDelete(task)">
                <mat-icon>delete_outline</mat-icon>
                <span>Delete</span>
              </button>
            </mat-menu>
          </div>
        }
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        animation: fadeInUp 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      // ── Filter bar ─────────────────────────────────────────────────────────
      .filter-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }

      .filter-group {
        display: flex;
        align-items: center;
        gap: 4px;
        background: var(--pln-card-bg, #fff);
        border: 1px solid var(--pln-card-border, #e4e4e7);
        border-radius: 12px;
        padding: 5px;
      }

      .filter-tab {
        padding: 6px 12px;
        border-radius: 8px;
        font-size: 0.8125rem;
        font-weight: 500;
        border: none;
        background: transparent;
        color: var(--pln-text-3, #71717a);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.15s;

        &:hover {
          background: var(--pln-card-hover, #f4f4f5);
          color: var(--pln-text-1, #18181b);
        }

        &--active {
          background: #2563eb;
          color: #fff;
          font-weight: 600;
        }
      }

      .filter-tab__count {
        min-width: 18px;
        height: 18px;
        border-radius: 9px;
        background: rgba(255, 255, 255, 0.25);
        font-size: 0.6875rem;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;

        .filter-tab:not(.filter-tab--active) & {
          background: var(--pln-card-border, #e4e4e7);
          color: var(--pln-text-3, #71717a);
        }
      }

      .priority-filter {
        padding: 5px 11px;
        border-radius: 8px;
        font-size: 0.75rem;
        font-weight: 500;
        border: none;
        background: transparent;
        color: var(--pln-text-3, #71717a);
        cursor: pointer;
        transition: all 0.15s;

        &:hover {
          background: var(--pln-card-hover, #f4f4f5);
        }

        &--all.priority-filter--active {
          background: #f4f4f5;
          color: #3f3f46;
          font-weight: 600;
        }
        &--low.priority-filter--active {
          background: rgba(2, 132, 199, 0.1);
          color: #0284c7;
          font-weight: 600;
        }
        &--medium.priority-filter--active {
          background: rgba(217, 119, 6, 0.1);
          color: #d97706;
          font-weight: 600;
        }
        &--high.priority-filter--active {
          background: rgba(220, 38, 38, 0.1);
          color: #dc2626;
          font-weight: 600;
        }
      }

      // ── Task list ──────────────────────────────────────────────────────────
      .task-list {
        display: flex;
        flex-direction: column;
        background: var(--pln-card-bg, #fff);
        border: 1px solid var(--pln-card-border, #e4e4e7);
        border-radius: 16px;
        overflow: hidden;
        box-shadow: var(--pln-card-shadow);
      }

      .task-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 16px;
        border-bottom: 1px solid var(--pln-card-border, #e4e4e7);
        transition: background 0.13s;

        &:last-child {
          border-bottom: none;
        }
        &:hover {
          background: #fafafa;
        }
      }

      .task-skeleton {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        border-bottom: 1px solid var(--pln-card-border, #e4e4e7);
        &:last-child {
          border-bottom: none;
        }
      }

      // ── Status button ──────────────────────────────────────────────────────
      .task-status-btn {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: none;
        background: transparent;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: opacity 0.15s;
        padding: 0;

        &:hover {
          opacity: 0.7;
        }

        &--todo .task-status-icon {
          color: #a1a1aa;
        }
        &--in_progress .task-status-icon {
          color: #2563eb;
        }
        &--done .task-status-icon {
          color: #059669;
        }
      }

      .task-status-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
      }

      // ── Content ────────────────────────────────────────────────────────────
      .task-content {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;

        &--done .task-title {
          text-decoration: line-through;
          color: var(--pln-text-3, #71717a);
        }
      }

      .task-title {
        font-size: 0.9375rem;
        font-weight: 500;
        color: var(--pln-text-1, #18181b);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .task-desc {
        font-size: 0.8125rem;
        color: var(--pln-text-3, #71717a);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      // ── Meta ───────────────────────────────────────────────────────────────
      .task-meta {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-shrink: 0;
      }

      .task-due {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--pln-text-3, #71717a);

        &--overdue {
          color: #dc2626;
        }
      }

      .task-due-icon {
        font-size: 13px;
        width: 13px;
        height: 13px;
      }

      .task-project {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--pln-text-3, #71717a);
      }

      .task-project-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      // ── Priority chip ──────────────────────────────────────────────────────
      .priority-chip {
        flex-shrink: 0;
        padding: 2px 9px;
        border-radius: 20px;
        font-size: 0.6875rem;
        font-weight: 600;
        letter-spacing: 0.02em;

        &--low {
          background: rgba(2, 132, 199, 0.1);
          color: #0284c7;
        }
        &--medium {
          background: rgba(217, 119, 6, 0.1);
          color: #d97706;
        }
        &--high {
          background: rgba(220, 38, 38, 0.1);
          color: #dc2626;
        }
      }

      .task-menu-btn {
        margin-left: -4px;
      }

      .menu-delete {
        color: #dc2626;
      }

      // ── Error banner ───────────────────────────────────────────────────────
      .error-banner {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px 20px;
        background: #fff1f2;
        border: 1px solid #fecdd3;
        border-radius: 14px;
        font-size: 0.875rem;
        color: #be123c;
      }

      .error-banner__icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }
    `,
  ],
})
export class TasksListComponent implements OnInit {
  readonly store = inject(TasksStore);
  private readonly projectsStore = inject(ProjectsStore);
  private readonly dialog = inject(MatDialog);

  readonly allTasks = toSignal(this.store.state$.pipe(map((s) => s.tasks)), { initialValue: [] });
  readonly loading = toSignal(this.store.state$.pipe(map((s) => s.loading)), {
    initialValue: true,
  });
  readonly error = toSignal(this.store.state$.pipe(map((s) => s.error)), { initialValue: null });

  private readonly projects = toSignal(this.projectsStore.state$.pipe(map((s) => s.projects)), {
    initialValue: [],
  });

  readonly activeStatus = signal<StatusFilter>('all');
  readonly activePriority = signal<PriorityFilter>('all');

  readonly filteredTasks = computed(() => {
    let tasks = this.allTasks();
    const s = this.activeStatus();
    const p = this.activePriority();
    if (s !== 'all') tasks = tasks.filter((t) => t.status === s);
    if (p !== 'all') tasks = tasks.filter((t) => t.priority === p);
    return tasks.slice().sort((a, b) => {
      // Undone first, then by due date, then by created
      if (a.status === 'DONE' && b.status !== 'DONE') return 1;
      if (a.status !== 'DONE' && b.status === 'DONE') return -1;
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return a.createdAt.localeCompare(b.createdAt);
    });
  });

  readonly statusFilters: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'TODO', label: 'To do' },
    { key: 'IN_PROGRESS', label: 'In progress' },
    { key: 'DONE', label: 'Done' },
  ];

  readonly priorityFilters: { key: PriorityFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'LOW', label: 'Low' },
    { key: 'MEDIUM', label: 'Medium' },
    { key: 'HIGH', label: 'High' },
  ];

  countByStatus(key: StatusFilter): number {
    const all = this.allTasks();
    return key === 'all' ? all.length : all.filter((t) => t.status === key).length;
  }

  readonly statusLabel = (s: TaskStatus) => STATUS_LABELS[s] ?? s;
  readonly priorityLabel = (p: TaskPriority) => PRIORITY_LABELS[p] ?? p;

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === 'DONE') return false;
    return task.dueDate < new Date().toISOString().slice(0, 10);
  }

  projectName(projectId: string | null): string | null {
    if (!projectId) return null;
    return this.projects().find((p) => p.id === projectId)?.name ?? null;
  }

  projectColor(projectId: string | null): string {
    if (!projectId) return '#2563eb';
    return this.projects().find((p) => p.id === projectId)?.color ?? '#2563eb';
  }

  clearFilters(): void {
    this.activeStatus.set('all');
    this.activePriority.set('all');
  }

  cycleStatus(task: Task): void {
    const next: Record<TaskStatus, TaskStatus> = {
      TODO: 'IN_PROGRESS',
      IN_PROGRESS: 'DONE',
      DONE: 'TODO',
    };
    this.store.update(task.id, { status: next[task.status] }).subscribe();
  }

  ngOnInit(): void {
    this.store.load();
  }

  openCreate(): void {
    this.dialog.open(TaskFormDialogComponent, {
      data: {},
      autoFocus: 'first-tabbable',
    });
  }

  openEdit(task: Task): void {
    this.dialog.open(TaskFormDialogComponent, {
      data: { task },
      autoFocus: 'first-tabbable',
    });
  }

  openDelete(task: Task): void {
    this.dialog.open(DeleteTaskDialogComponent, { data: task });
  }
}
