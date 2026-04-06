import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { ProjectsApiService } from '../../data-access/projects-api.service';
import { EditProjectDialogComponent } from '../../components/edit-project-dialog/edit-project-dialog.component';
import { Project, ProjectStatus } from '../../models/project.models';
import { TasksStore } from '../../../tasks/data-access/tasks.store';
import { TaskFormDialogComponent } from '../../../tasks/components/task-form-dialog/task-form-dialog.component';
import { DeleteTaskDialogComponent } from '../../../tasks/components/delete-task-dialog/delete-task-dialog.component';
import { Task, TaskStatus, TaskPriority } from '../../../tasks/models/task.models';

const STATUS_MAP: Record<ProjectStatus, { label: string; cssClass: string }> = {
  active: { label: 'Active', cssClass: 'badge--active' },
  on_hold: { label: 'On hold', cssClass: 'badge--hold' },
  completed: { label: 'Completed', cssClass: 'badge--done' },
  archived: { label: 'Archived', cssClass: 'badge--archived' },
};

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    NgClass,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatMenuModule,
  ],
  template: `
    <a routerLink="/projects" class="back-nav">
      <mat-icon class="back-nav__icon">arrow_back</mat-icon>
      <span>All projects</span>
    </a>

    @if (loading()) {
      <div class="loading-state"><mat-spinner diameter="44" /></div>
    } @else if (error()) {
      <div class="error-card">
        <div class="error-card__icon-wrap"><mat-icon>error_outline</mat-icon></div>
        <h3 class="error-card__title">Project not found</h3>
        <p class="error-card__text">{{ error() }}</p>
        <a mat-flat-button routerLink="/projects">Back to projects</a>
      </div>
    } @else if (project()) {
      <div class="hero-card">
        <div class="hero-card__banner" [style.background]="project()!.color ?? '#2563EB'">
          <div class="hero-card__banner-overlay"></div>
        </div>
        <div class="hero-card__body">
          <div class="hero-card__top">
            <div class="hero-card__icon-circle" [style.background]="project()!.color ?? '#2563EB'">
              <mat-icon>folder_open</mat-icon>
            </div>
            <div class="hero-card__actions">
              <span class="status-badge" [ngClass]="statusInfo(project()!.status).cssClass">
                {{ statusInfo(project()!.status).label }}
              </span>
              <button mat-flat-button (click)="openEdit()"><mat-icon>edit</mat-icon>Edit</button>
            </div>
          </div>
          <h1 class="hero-card__title">{{ project()!.name }}</h1>
          @if (project()!.description) {
            <p class="hero-card__desc">{{ project()!.description }}</p>
          }
          <div class="hero-card__meta">
            <span class="meta-pill">
              <mat-icon class="meta-pill__icon">calendar_today</mat-icon>
              Created {{ project()!.createdAt | date: 'MMM d, y' }}
            </span>
            <span class="meta-pill">
              <mat-icon class="meta-pill__icon">update</mat-icon>
              Updated {{ project()!.updatedAt | date: 'MMM d, y' }}
            </span>
          </div>
        </div>
      </div>

      <div class="section-card">
        <div class="section-card__header">
          <h2 class="section-card__title">
            <mat-icon class="section-icon">task_alt</mat-icon>Tasks
          </h2>
          <button mat-flat-button class="add-task-btn" (click)="openCreateTask()">
            <mat-icon>add</mat-icon>New task
          </button>
        </div>

        @if (tasksLoading()) {
          @for (_ of [1, 2, 3]; track $index) {
            <div class="task-row-skeleton">
              <div class="skeleton skeleton-circle"></div>
              <div class="skeleton-lines">
                <div class="skeleton skeleton-text" style="width:55%"></div>
                <div
                  class="skeleton skeleton-text"
                  style="width:30%;height:10px;margin-top:4px"
                ></div>
              </div>
              <div
                class="skeleton skeleton-text"
                style="width:60px;height:20px;border-radius:10px;margin-left:auto"
              ></div>
            </div>
          }
        } @else if (projectTasks().length === 0) {
          <div class="tasks-empty">
            <div class="tcs-icon-wrap"><mat-icon>task_alt</mat-icon></div>
            <div>
              <p class="tcs-text">No tasks for this project yet.</p>
              <button mat-button class="tcs-action" (click)="openCreateTask()">
                Create first task
              </button>
            </div>
          </div>
        } @else {
          @for (task of projectTasks(); track task.id) {
            <div class="task-row" [class.task-row--done]="task.status === 'DONE'">
              <button
                class="status-btn"
                [class]="'status-btn--' + task.status"
                (click)="cycleStatus(task)"
                [title]="task.status"
              >
                @if (task.status === 'DONE') {
                  <mat-icon>check_circle</mat-icon>
                } @else if (task.status === 'IN_PROGRESS') {
                  <mat-icon>pending</mat-icon>
                } @else {
                  <mat-icon>radio_button_unchecked</mat-icon>
                }
              </button>
              <div class="task-info">
                <span class="task-title">{{ task.title }}</span>
                @if (task.dueDate) {
                  <span class="task-due" [class.task-due--overdue]="isOverdue(task)">
                    <mat-icon class="due-icon">schedule</mat-icon>
                    {{ task.dueDate | date: 'MMM d' }}
                  </span>
                }
              </div>
              <span class="priority-chip priority-chip--{{ task.priority.toLowerCase() }}">{{
                task.priority
              }}</span>
              <button mat-icon-button [matMenuTriggerFor]="taskMenu" class="task-more-btn">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #taskMenu="matMenu">
                <button mat-menu-item (click)="openEditTask(task)">
                  <mat-icon>edit</mat-icon>Edit
                </button>
                <button mat-menu-item class="danger-item" (click)="openDeleteTask(task)">
                  <mat-icon>delete</mat-icon>Delete
                </button>
              </mat-menu>
            </div>
          }
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

      .back-nav {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--pln-text-3, #71717a);
        text-decoration: none;
        margin-bottom: 24px;
        padding: 6px 10px 6px 6px;
        border-radius: 8px;
        transition:
          background 0.13s,
          color 0.13s;
        &:hover {
          background: rgba(0, 0, 0, 0.04);
          color: var(--pln-text-1, #18181b);
          text-decoration: none;
        }
      }
      .back-nav__icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }

      .hero-card {
        background: var(--pln-card-bg, #fff);
        border: 1px solid var(--pln-card-border, #e4e4e7);
        border-radius: 20px;
        overflow: hidden;
        margin-bottom: 20px;
        box-shadow: var(--pln-card-shadow);
      }
      .hero-card__banner {
        height: 80px;
        position: relative;
        overflow: hidden;
      }
      .hero-card__banner-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.08), rgba(255, 255, 255, 0.05));
      }
      .hero-card__body {
        padding: 0 28px 28px;
      }
      .hero-card__top {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        margin-bottom: 16px;
        margin-top: -28px;
      }
      .hero-card__icon-circle {
        width: 56px;
        height: 56px;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid #fff;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
        flex-shrink: 0;
        mat-icon {
          color: #fff;
          font-size: 26px;
          width: 26px;
          height: 26px;
        }
      }
      .hero-card__actions {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .hero-card__title {
        margin: 0 0 8px;
        font-size: 1.75rem;
        font-weight: 800;
        color: var(--pln-text-1, #18181b);
        letter-spacing: -0.04em;
        line-height: 1.15;
      }
      .hero-card__desc {
        margin: 0 0 18px;
        font-size: 0.9375rem;
        color: var(--pln-text-3, #71717a);
        line-height: 1.65;
        max-width: 640px;
      }
      .hero-card__meta {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .meta-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        border-radius: 20px;
        background: #f4f4f5;
        border: 1px solid #e4e4e7;
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--pln-text-3, #71717a);
        &__icon {
          font-size: 12px;
          width: 12px;
          height: 12px;
        }
      }
      .status-badge {
        display: inline-flex;
        align-items: center;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        white-space: nowrap;
        &.badge--active {
          background: #ecfdf5;
          color: #059669;
          border: 1px solid #a7f3d0;
        }
        &.badge--hold {
          background: #fffbeb;
          color: #b45309;
          border: 1px solid #fde68a;
        }
        &.badge--done {
          background: #eff6ff;
          color: #1d4ed8;
          border: 1px solid #bfdbfe;
        }
        &.badge--archived {
          background: #f4f4f5;
          color: #71717a;
          border: 1px solid #e4e4e7;
        }
      }
      .section-card {
        background: var(--pln-card-bg, #fff);
        border: 1px solid var(--pln-card-border, #e4e4e7);
        border-radius: 16px;
        overflow: hidden;
        box-shadow: var(--pln-card-shadow);
      }
      .section-card__header {
        padding: 16px 24px;
        border-bottom: 1px solid var(--pln-card-border, #e4e4e7);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .section-card__title {
        margin: 0;
        font-size: 0.9375rem;
        font-weight: 700;
        color: var(--pln-text-1, #18181b);
        letter-spacing: -0.02em;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .section-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #2563eb;
      }
      .add-task-btn {
        font-size: 0.8125rem;
        font-weight: 600;
        height: 32px;
        line-height: 32px;
        padding: 0 12px;
        border-radius: 8px;
        background: #2563eb;
        color: #fff;
        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
          margin-right: 2px;
        }
      }
      .task-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 20px;
        border-bottom: 1px solid var(--pln-card-border, #e4e4e7);
        transition: background 0.1s;
        &:last-child {
          border-bottom: none;
        }
        &:hover {
          background: rgba(0, 0, 0, 0.02);
        }
        &--done .task-title {
          text-decoration: line-through;
          color: var(--pln-text-3, #71717a);
        }
      }
      .task-row-skeleton {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 20px;
        border-bottom: 1px solid var(--pln-card-border, #e4e4e7);
        &:last-child {
          border-bottom: none;
        }
      }
      .skeleton-circle {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .skeleton-lines {
        flex: 1;
      }
      .status-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        border-radius: 50%;
        width: 28px;
        height: 28px;
        transition: background 0.1s;
        mat-icon {
          font-size: 22px;
          width: 22px;
          height: 22px;
        }
        &--TODO mat-icon {
          color: #a1a1aa;
        }
        &--IN_PROGRESS mat-icon {
          color: #2563eb;
        }
        &--DONE mat-icon {
          color: #059669;
        }
        &:hover {
          background: rgba(0, 0, 0, 0.05);
        }
      }
      .task-info {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .task-title {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--pln-text-1, #18181b);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .task-due {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 0.75rem;
        color: var(--pln-text-3, #71717a);
        white-space: nowrap;
        flex-shrink: 0;
        &--overdue {
          color: #ef4444;
        }
        .due-icon {
          font-size: 11px;
          width: 11px;
          height: 11px;
        }
      }
      .priority-chip {
        font-size: 0.6875rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        padding: 2px 8px;
        border-radius: 10px;
        white-space: nowrap;
        flex-shrink: 0;
        &--low {
          background: #f0fdf4;
          color: #16a34a;
          border: 1px solid #bbf7d0;
        }
        &--medium {
          background: #fffbeb;
          color: #b45309;
          border: 1px solid #fde68a;
        }
        &--high {
          background: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }
      }
      .task-more-btn {
        flex-shrink: 0;
      }
      .danger-item {
        color: #ef4444;
      }
      .tasks-empty {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 28px 24px;
        color: var(--pln-text-3, #71717a);
      }
      .tcs-icon-wrap {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: rgba(37, 99, 235, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        mat-icon {
          color: #2563eb;
          font-size: 20px;
          width: 20px;
          height: 20px;
        }
      }
      .tcs-text {
        margin: 0 0 4px;
        font-size: 0.875rem;
        line-height: 1.55;
      }
      .tcs-action {
        font-size: 0.8125rem;
        color: #2563eb;
        padding: 0;
      }
      .loading-state {
        display: flex;
        justify-content: center;
        margin-top: 80px;
      }
      .error-card {
        background: var(--pln-card-bg, #fff);
        border: 1px solid var(--pln-card-border, #e4e4e7);
        border-radius: 20px;
        padding: 56px 40px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        max-width: 480px;
      }
      .error-card__icon-wrap {
        width: 56px;
        height: 56px;
        border-radius: 16px;
        background: #fef2f2;
        border: 1px solid #fecaca;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;
        mat-icon {
          color: #ef4444;
          font-size: 28px;
          width: 28px;
          height: 28px;
        }
      }
      .error-card__title {
        margin: 0 0 8px;
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--pln-text-1, #18181b);
      }
      .error-card__text {
        margin: 0 0 24px;
        font-size: 0.875rem;
        color: var(--pln-text-3, #71717a);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ProjectsApiService);
  private readonly dialog = inject(MatDialog);
  private readonly tasksStore = inject(TasksStore);

  readonly project = signal<Project | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  private readonly allTasks = toSignal(this.tasksStore.state$.pipe(map((s) => s.tasks)), {
    initialValue: [] as Task[],
  });
  readonly tasksLoading = toSignal(this.tasksStore.state$.pipe(map((s) => s.loading)), {
    initialValue: true,
  });
  readonly projectTasks = computed(() => {
    const id = this.project()?.id;
    return this.allTasks().filter((t) => t.projectId === id);
  });

  statusInfo(status: ProjectStatus) {
    return STATUS_MAP[status] ?? { label: status, cssClass: '' };
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === 'DONE') return false;
    return task.dueDate.slice(0, 10) < new Date().toISOString().slice(0, 10);
  }

  cycleStatus(task: Task): void {
    const next: Record<TaskStatus, TaskStatus> = {
      TODO: 'IN_PROGRESS',
      IN_PROGRESS: 'DONE',
      DONE: 'TODO',
    };
    this.tasksStore.update(task.id, { status: next[task.status] }).subscribe();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getById(id).subscribe({
      next: (p) => {
        this.project.set(p);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Project not found.');
        this.loading.set(false);
      },
    });
    this.tasksStore.load();
  }

  openEdit(): void {
    if (!this.project()) return;
    const ref = this.dialog.open(EditProjectDialogComponent, {
      data: this.project(),
      autoFocus: 'first-tabbable',
    });
    ref.afterClosed().subscribe((updated: Project | undefined) => {
      if (updated) this.project.set(updated);
    });
  }

  openCreateTask(): void {
    const ref = this.dialog.open(TaskFormDialogComponent, {
      data: { task: null, defaultProjectId: this.project()?.id },
      autoFocus: 'first-tabbable',
      width: '520px',
    });
    ref.afterClosed().subscribe((created: Task | undefined) => {
      if (created) this.tasksStore.load();
    });
  }

  openEditTask(task: Task): void {
    const ref = this.dialog.open(TaskFormDialogComponent, {
      data: { task },
      autoFocus: 'first-tabbable',
      width: '520px',
    });
    ref.afterClosed().subscribe((updated: Task | undefined) => {
      if (updated) this.tasksStore.load();
    });
  }

  openDeleteTask(task: Task): void {
    const ref = this.dialog.open(DeleteTaskDialogComponent, {
      data: { task },
      autoFocus: 'first-tabbable',
    });
    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) this.tasksStore.delete(task.id).subscribe();
    });
  }
}
