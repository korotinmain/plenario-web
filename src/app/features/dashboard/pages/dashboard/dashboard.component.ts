import { Component, ChangeDetectionStrategy, inject, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { StatCardComponent } from '../../../../shared/ui/stat-card/stat-card.component';
import { ProjectsStore } from '../../../projects/data-access/projects.store';
import { TasksStore } from '../../../tasks/data-access/tasks.store';
import { TaskFormDialogComponent } from '../../../tasks/components/task-form-dialog/task-form-dialog.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { Task, TaskStatus } from '../../../tasks/models/task.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, MatButtonModule, MatIconModule, StatCardComponent],
  template: `
    <!-- ── Hero ──────────────────────────────────────────────────────────── -->
    <div class="hero">
      <div class="hero-text">
        <h1 class="hero-greeting">{{ greeting() }}</h1>
        <p class="hero-date">{{ today | date: 'EEEE, MMMM d, y' }}</p>
      </div>
      <div class="hero-actions">
        <a mat-flat-button routerLink="/projects">
          <mat-icon>add</mat-icon>
          New project
        </a>
      </div>
    </div>

    <!-- ── Stat cards ─────────────────────────────────────────────────────── -->
    @if (loading()) {
      <div class="stats-grid">
        @for (_ of [1, 2, 3, 4]; track $index) {
          <div class="skeleton-stat-card"></div>
        }
      </div>
    } @else {
      <div class="stats-grid stagger-cards">
        <app-stat-card
          label="All projects"
          [value]="totalProjects()"
          icon="folder_open"
          gradient="violet"
        />
        <app-stat-card label="Open tasks" [value]="openTasks()" icon="task_alt" gradient="blue" />
        <app-stat-card
          label="Due today"
          [value]="dueTodayCount()"
          icon="schedule"
          gradient="amber"
        />
        <app-stat-card
          label="Upcoming"
          [value]="upcomingCount()"
          icon="upcoming"
          gradient="emerald"
        />
      </div>
    }

    <!-- ── Bottom grid ────────────────────────────────────────────────────── -->
    <div class="bottom-grid">
      <!-- Recent projects -->
      <div class="panel">
        <div class="panel-header">
          <h2 class="panel-title">Recent projects</h2>
          <a routerLink="/projects" class="panel-link">
            View all
            <mat-icon class="panel-link-icon">arrow_forward</mat-icon>
          </a>
        </div>
        @if (loading()) {
          <div class="project-list">
            @for (_ of [1, 2, 3, 4, 5]; track $index) {
              <div class="project-row-skeleton">
                <div
                  class="skeleton"
                  style="width:10px;height:10px;border-radius:50%;flex-shrink:0"
                ></div>
                <div class="skeleton skeleton-text" style="flex:1;max-width:200px"></div>
                <div class="skeleton" style="width:60px;height:20px;border-radius:20px"></div>
              </div>
            }
          </div>
        } @else if (recentProjects().length === 0) {
          <div class="panel-empty">
            <mat-icon class="panel-empty-icon">folder_open</mat-icon>
            <span>No projects yet — create your first one.</span>
          </div>
        } @else {
          <div class="project-list">
            @for (p of recentProjects(); track p.id) {
              <a [routerLink]="['/projects', p.id]" class="project-row">
                <span class="project-row__dot" [style.background]="p.color ?? '#2563EB'"></span>
                <span class="project-row__name">{{ p.name }}</span>
                <span class="pstatus" [class]="'pstatus--' + p.status">
                  {{ statusLabel(p.status) }}
                </span>
              </a>
            }
          </div>
        }
      </div>

      <!-- Today's tasks -->
      <div class="panel">
        <div class="panel-header">
          <h2 class="panel-title">Today's tasks</h2>
          <a routerLink="/tasks/today" class="panel-link">
            View all
            <mat-icon class="panel-link-icon">arrow_forward</mat-icon>
          </a>
        </div>
        @if (tasksLoading()) {
          <div class="task-list">
            @for (_ of [1, 2, 3]; track $index) {
              <div class="task-row-skeleton">
                <div
                  class="skeleton"
                  style="width:22px;height:22px;border-radius:50%;flex-shrink:0"
                ></div>
                <div class="skeleton skeleton-text" style="flex:1;max-width:180px"></div>
                <div class="skeleton" style="width:48px;height:18px;border-radius:10px"></div>
              </div>
            }
          </div>
        } @else if (todayTasks().length === 0) {
          <div class="panel-empty">
            <mat-icon class="panel-empty-icon">task_alt</mat-icon>
            <div>
              <p style="margin:0 0 6px;font-weight:600;color:var(--pln-text-1)">All clear!</p>
              <span>No tasks due today.</span>
            </div>
          </div>
        } @else {
          <div class="task-list">
            @for (task of todayTasks(); track task.id) {
              <div class="task-row" [class.task-row--done]="task.status === 'DONE'">
                <button
                  class="status-btn status-btn--{{ task.status }}"
                  (click)="cycleStatus(task)"
                >
                  @if (task.status === 'DONE') {
                    <mat-icon>check_circle</mat-icon>
                  } @else if (task.status === 'IN_PROGRESS') {
                    <mat-icon>pending</mat-icon>
                  } @else {
                    <mat-icon>radio_button_unchecked</mat-icon>
                  }
                </button>
                <span class="task-row__name">{{ task.title }}</span>
                <span class="priority-chip priority-chip--{{ task.priority.toLowerCase() }}">{{
                  task.priority
                }}</span>
              </div>
            }
          </div>
          <div class="panel-footer">
            <button mat-button class="panel-add-btn" (click)="openCreateTask()">
              <mat-icon>add</mat-icon> New task for today
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        animation: fadeInUp 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      // ── Hero ───────────────────────────────────────────────────────────────
      .hero {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 32px;
      }

      .hero-greeting {
        margin: 0 0 6px;
        font-size: 2rem;
        font-weight: 800;
        color: var(--pln-text-1, #18181b);
        letter-spacing: -0.04em;
        line-height: 1.1;
      }

      .hero-date {
        margin: 0;
        font-size: 0.875rem;
        color: var(--pln-text-3, #71717a);
        font-weight: 500;
      }

      .hero-actions {
        padding-top: 4px;
        flex-shrink: 0;
      }

      // ── Stat grid ──────────────────────────────────────────────────────────
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        margin-bottom: 28px;

        @media (max-width: 900px) {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      // ── Bottom grid ────────────────────────────────────────────────────────
      .bottom-grid {
        display: grid;
        grid-template-columns: 1fr 380px;
        gap: 20px;

        @media (max-width: 900px) {
          grid-template-columns: 1fr;
        }
      }

      // ── Panel (card) ───────────────────────────────────────────────────────
      .panel {
        background: var(--pln-card-bg, #fff);
        border: 1px solid var(--pln-card-border, #e4e4e7);
        border-radius: 16px;
        box-shadow: var(--pln-card-shadow);
        overflow: hidden;
      }

      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 18px 22px 14px;
        border-bottom: 1px solid var(--pln-card-border, #e4e4e7);
      }

      .panel-title {
        margin: 0;
        font-size: 0.9375rem;
        font-weight: 700;
        color: var(--pln-text-1, #18181b);
        letter-spacing: -0.02em;
      }

      .panel-link {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 0.8125rem;
        font-weight: 600;
        color: #2563eb;
      }

      .panel-link-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
      }

      .panel-empty {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 32px 22px;
        color: var(--pln-text-3, #71717a);
        font-size: 0.875rem;
      }

      .panel-empty-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        opacity: 0.45;
      }

      // ── Project list ───────────────────────────────────────────────────────
      .project-list {
        display: flex;
        flex-direction: column;
      }

      .project-row-skeleton {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px 22px;
        border-bottom: 1px solid var(--pln-card-border, #e4e4e7);
        &:last-child {
          border-bottom: none;
        }
      }

      .project-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 13px 22px;
        text-decoration: none;
        border-bottom: 1px solid var(--pln-card-border, #e4e4e7);
        transition: background 0.13s;

        &:last-child {
          border-bottom: none;
        }
        &:hover {
          background: #f9f9fb;
        }

        &__dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        &__name {
          flex: 1;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--pln-text-1, #18181b);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }

      // Status pill
      .pstatus {
        padding: 2px 8px;
        border-radius: 20px;
        font-size: 0.6875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        white-space: nowrap;

        &--active {
          background: var(--pln-status-active-bg, #ecfdf5);
          color: var(--pln-status-active-color, #059669);
        }
        &--on_hold {
          background: var(--pln-status-hold-bg, #fffbeb);
          color: var(--pln-status-hold-color, #b45309);
        }
        &--completed {
          background: var(--pln-status-done-bg, #eff6ff);
          color: var(--pln-status-done-color, #1d4ed8);
        }
        &--archived {
          background: var(--pln-status-archived-bg, #f4f4f5);
          color: var(--pln-status-archived-color, #71717a);
        }
      }

      // ── Task list (today panel) ────────────────────────────────────────────
      .task-list {
        display: flex;
        flex-direction: column;
      }

      .task-row-skeleton {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 22px;
        border-bottom: 1px solid var(--pln-card-border, #e4e4e7);
        &:last-child {
          border-bottom: none;
        }
      }

      .task-row {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 10px 18px;
        border-bottom: 1px solid var(--pln-card-border, #e4e4e7);
        transition: background 0.12s;
        &:last-child {
          border-bottom: none;
        }
        &:hover {
          background: #f9f9fb;
        }
        &--done .task-row__name {
          text-decoration: line-through;
          color: var(--pln-text-3, #71717a);
        }

        &__name {
          flex: 1;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--pln-text-1, #18181b);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
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
        width: 24px;
        height: 24px;
        border-radius: 50%;
        transition: background 0.1s;
        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
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

      .priority-chip {
        font-size: 0.625rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        padding: 2px 7px;
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

      .panel-footer {
        padding: 8px 16px;
        border-top: 1px solid var(--pln-card-border, #e4e4e7);
      }

      .panel-add-btn {
        font-size: 0.8125rem;
        color: #2563eb;
        padding: 0 4px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly store = inject(ProjectsStore);
  private readonly tasksStore = inject(TasksStore);
  private readonly dialog = inject(MatDialog);
  private readonly authService = inject(AuthService);

  readonly today = new Date();
  readonly todayStr = new Date().toISOString().slice(0, 10);
  readonly user = toSignal(this.authService.user$);

  private readonly projects = toSignal(this.store.state$.pipe(map((s) => s.projects)), {
    initialValue: [],
  });
  private readonly allTasks = toSignal(this.tasksStore.state$.pipe(map((s) => s.tasks)), {
    initialValue: [] as Task[],
  });

  readonly loading = toSignal(this.store.state$.pipe(map((s) => s.loading)), {
    initialValue: true,
  });
  readonly tasksLoading = toSignal(this.tasksStore.state$.pipe(map((s) => s.loading)), {
    initialValue: true,
  });

  readonly totalProjects = computed(() => this.projects().length);

  readonly openTasks = computed(
    () => this.allTasks().filter((t) => t.status === 'TODO' || t.status === 'IN_PROGRESS').length,
  );
  readonly dueTodayCount = computed(
    () =>
      this.allTasks().filter(
        (t) => t.dueDate?.slice(0, 10) === this.todayStr && t.status !== 'DONE',
      ).length,
  );
  readonly upcomingCount = computed(
    () =>
      this.allTasks().filter(
        (t) => (t.dueDate?.slice(0, 10) ?? '') > this.todayStr && t.status !== 'DONE',
      ).length,
  );

  readonly todayTasks = computed(() =>
    this.allTasks()
      .filter((t) => t.dueDate?.slice(0, 10) === this.todayStr)
      .sort((a, b) => {
        const order: Record<TaskStatus, number> = { TODO: 0, IN_PROGRESS: 1, DONE: 2 };
        return order[a.status] - order[b.status];
      })
      .slice(0, 8),
  );

  readonly recentProjects = computed(() =>
    [...this.projects()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6),
  );

  readonly greeting = computed(() => {
    const name = this.user()?.name;
    const first = name?.split(' ')[0];
    const hour = new Date().getHours();
    const prefix =
      hour >= 5 && hour < 12
        ? 'Good morning'
        : hour >= 12 && hour < 17
          ? 'Good afternoon'
          : hour >= 17 && hour < 21
            ? 'Good evening'
            : 'Good night';
    return first ? `${prefix}, ${first} 👋` : prefix;
  });

  readonly statusLabel = (status: string): string =>
    ({
      active: 'Active',
      on_hold: 'On hold',
      completed: 'Completed',
      archived: 'Archived',
    })[status] ?? status;

  cycleStatus(task: Task): void {
    const next: Record<TaskStatus, TaskStatus> = {
      TODO: 'IN_PROGRESS',
      IN_PROGRESS: 'DONE',
      DONE: 'TODO',
    };
    this.tasksStore.update(task.id, { status: next[task.status] }).subscribe();
  }

  openCreateTask(): void {
    const todayDate = this.todayStr;
    this.dialog.open(TaskFormDialogComponent, {
      data: { task: null, defaultDueDate: todayDate },
      autoFocus: 'first-tabbable',
      width: '520px',
    });
  }

  ngOnInit(): void {
    this.store.load();
    this.tasksStore.load();
  }
}
