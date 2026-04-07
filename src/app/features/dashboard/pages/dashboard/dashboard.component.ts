import { Component, ChangeDetectionStrategy, inject, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { ProjectsStore } from '../../../projects/data-access/projects.store';
import { TasksStore } from '../../../tasks/data-access/tasks.store';
import { TaskFormDialogComponent } from '../../../tasks/components/task-form-dialog/task-form-dialog.component';
import { ProjectFormDialogComponent } from '../../../projects/components/project-form-dialog/project-form-dialog.component';
import { AllProjectsDialogComponent } from '../../../projects/components/all-projects-dialog/all-projects-dialog.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { Task, TaskStatus } from '../../../tasks/models/task.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, NgTemplateOutlet, MatButtonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- ── Hero ──────────────────────────────────────────────────────────── -->
    <div class="hero">
      <div class="hero-left">
        <h1 class="hero-greeting">{{ greeting() }}</h1>
        <p class="hero-date">{{ today | date: 'EEEE, MMMM d, y' }}</p>
      </div>
      <div class="hero-actions">
        <button mat-stroked-button class="btn-secondary" (click)="openCreateTask()">
          <mat-icon>add</mat-icon>
          New task
        </button>
        <button mat-flat-button class="btn-primary" (click)="openCreateProject()">
          <mat-icon>add</mat-icon>
          New project
        </button>
      </div>
    </div>

    <!-- ── KPI strip ─────────────────────────────────────────────────────── -->
    @if (loading() || tasksLoading()) {
      <div class="kpi-strip">
        @for (_ of [1, 2, 3, 4]; track $index) {
          <div class="kpi-skeleton"></div>
        }
      </div>
    } @else {
      <div class="kpi-strip stagger-cards">
        <!-- Projects -->
        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--blue">
            <mat-icon>folder_open</mat-icon>
          </div>
          <div class="kpi-body">
            <div class="kpi-value">{{ totalProjects() }}</div>
            <div class="kpi-label">Projects</div>
            <div class="kpi-sub">{{ activeProjectsCount() }} active</div>
          </div>
        </div>

        <!-- Open tasks -->
        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--violet">
            <mat-icon>task_alt</mat-icon>
          </div>
          <div class="kpi-body">
            <div class="kpi-value">{{ openTasks() }}</div>
            <div class="kpi-label">Open tasks</div>
            <div class="kpi-sub">{{ inProgressCount() }} in progress</div>
          </div>
        </div>

        <!-- Due today -->
        <div class="kpi-card">
          <div class="kpi-icon kpi-icon--amber">
            <mat-icon>today</mat-icon>
          </div>
          <div class="kpi-body">
            <div class="kpi-value">{{ dueTodayCount() }}</div>
            <div class="kpi-label">Due today</div>
            <div class="kpi-sub">{{ completedTodayCount() }} completed</div>
          </div>
        </div>

        <!-- Overdue -->
        <div class="kpi-card" [class.kpi-card--alert]="overdueCount() > 0">
          <div class="kpi-icon" [class]="overdueCount() > 0 ? 'kpi-icon--red' : 'kpi-icon--green'">
            <mat-icon>{{ overdueCount() > 0 ? 'warning_amber' : 'check_circle' }}</mat-icon>
          </div>
          <div class="kpi-body">
            <div class="kpi-value" [class.kpi-value--red]="overdueCount() > 0">
              {{ overdueCount() }}
            </div>
            <div class="kpi-label">Overdue</div>
            <div class="kpi-sub">{{ upcomingCount() }} upcoming</div>
          </div>
        </div>
      </div>
    }

    <!-- ── Main grid ──────────────────────────────────────────────────────── -->
    <div class="dash-grid">
      <!-- ── Focus panel (left / wide) ────────────────────────────────── -->
      <div class="panel panel--focus">
        <div class="panel-hd">
          <div>
            <h2 class="panel-title">Today's focus</h2>
            <p class="panel-sub">
              @if (overdueCount() + todayTasks().length === 0) {
                All caught up
              } @else {
                {{ overdueCount() + todayTasks().length }} tasks need attention
              }
            </p>
          </div>
        </div>

        @if (tasksLoading()) {
          <div class="task-list">
            @for (_ of [1, 2, 3]; track $index) {
              <div class="task-skeleton"></div>
            }
          </div>
        } @else {
          <!-- Overdue section -->
          @if (overdueTasks().length > 0) {
            <div class="focus-section">
              <div class="focus-section__label focus-section__label--danger">
                <mat-icon>warning_amber</mat-icon>
                Overdue · {{ overdueTasks().length }}
              </div>
              <div class="task-list">
                @for (task of overdueTasks(); track task.id) {
                  <ng-container
                    *ngTemplateOutlet="taskRow; context: { $implicit: task, overdue: true }"
                  ></ng-container>
                }
              </div>
            </div>
          }

          <!-- Today section -->
          @if (todayTasks().length > 0) {
            <div class="focus-section">
              @if (overdueTasks().length > 0) {
                <div class="focus-section__label">Today · {{ todayTasks().length }}</div>
              }
              <div class="task-list">
                @for (task of todayTasks(); track task.id) {
                  <ng-container
                    *ngTemplateOutlet="taskRow; context: { $implicit: task, overdue: false }"
                  ></ng-container>
                }
              </div>
            </div>
          }

          <!-- Empty -->
          @if (overdueCount() === 0 && todayTasks().length === 0) {
            <div class="panel-empty">
              <div class="panel-empty__icon-wrap panel-empty__icon-wrap--green">
                <mat-icon>celebration</mat-icon>
              </div>
              <div>
                <p class="panel-empty__title">All clear!</p>
                <p class="panel-empty__sub">No overdue or due-today tasks. Enjoy the day.</p>
              </div>
            </div>
          }

          <div class="panel-footer">
            <button mat-button class="add-task-btn" (click)="openCreateTask()">
              <mat-icon>add</mat-icon>
              Add task for today
            </button>
          </div>
        }
      </div>

      <!-- ── Projects panel (right / narrow) ──────────────────────────── -->
      <div class="panel">
        <div class="panel-hd">
          <div>
            <h2 class="panel-title">Projects</h2>
            <p class="panel-sub">{{ activeProjectsCount() }} active · {{ totalProjects() }} total</p>
          </div>
          <button (click)="openAllProjects()" class="panel-viewall">
            View all
            <mat-icon>arrow_forward</mat-icon>
          </button>
        </div>

        @if (loading()) {
          <div class="proj-list">
            @for (_ of [1, 2, 3, 4, 5]; track $index) {
              <div class="proj-skeleton"></div>
            }
          </div>
        } @else if (projectsWithStats().length === 0) {
          <div class="panel-empty">
            <div class="panel-empty__icon-wrap">
              <mat-icon>rocket_launch</mat-icon>
            </div>
            <div>
              <p class="panel-empty__title">No projects yet</p>
              <p class="panel-empty__sub">Create your first project to start tracking work.</p>
            </div>
          </div>
        } @else {
          <div class="proj-list">
            @for (p of projectsWithStats(); track p.id) {
              <a [routerLink]="['/projects', p.id]" class="proj-row">
                <span class="proj-color-dot" [style.background]="p.color ?? '#4c68c0'"></span>
                <div class="proj-content">
                  <div class="proj-row-top">
                    <span class="proj-name">{{ p.name }}</span>
                    <span class="proj-status-pill" [class]="'pill--' + p.status">
                      {{ statusLabel(p.status) }}
                    </span>
                  </div>
                  @if (p.total > 0) {
                    <div class="proj-progress-row">
                      <div class="prog-track">
                        <div
                          class="prog-fill"
                          [style.width.%]="p.pct"
                          [style.background]="p.pct === 100 ? '#059669' : (p.color ?? '#4c68c0')"
                        ></div>
                      </div>
                      <span class="prog-label">{{ p.done }}/{{ p.total }}</span>
                      <span class="prog-pct" [class.prog-pct--done]="p.pct === 100">
                        {{ p.pct }}%
                      </span>
                    </div>
                  } @else {
                    <div class="proj-no-tasks">No tasks yet</div>
                  }
                </div>
              </a>
            }
          </div>
        }
      </div>
    </div>

    <!-- ── Task row template ─────────────────────────────────────────────── -->
    <ng-template #taskRow let-task let-overdue="overdue">
      <div class="task-row" [class.task-row--done]="task.status === 'DONE'">
        <button
          class="toggle-btn"
          [class]="'toggle-btn--' + task.status"
          (click)="cycleStatus(task)"
          title="Cycle status"
        >
          @if (task.status === 'DONE') {
            <mat-icon>check_circle</mat-icon>
          } @else if (task.status === 'IN_PROGRESS') {
            <mat-icon>pending</mat-icon>
          } @else {
            <mat-icon>radio_button_unchecked</mat-icon>
          }
        </button>

        <div class="task-body">
          <span class="task-name">{{ task.title }}</span>
          @if (overdue && task.dueDate) {
            <span class="task-due-badge">{{ task.dueDate | date: 'MMM d' }}</span>
          }
        </div>

        <span
          class="prio-dot"
          [class]="'prio-dot--' + task.priority.toLowerCase()"
          [title]="task.priority"
        ></span>
      </div>
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: block;
        animation: fadeInUp 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      // ── Hero ──────────────────────────────────────────────────────────────
      .hero {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 28px;
      }

      .hero-greeting {
        margin: 0 0 5px;
        font-size: 1.875rem;
        font-weight: 800;
        color: var(--pln-text-1);
        letter-spacing: -0.04em;
        line-height: 1.1;
      }

      .hero-date {
        margin: 0;
        font-size: 0.875rem;
        color: var(--pln-text-3);
        font-weight: 500;
      }

      .hero-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        padding-top: 4px;
        flex-shrink: 0;
      }

      .btn-primary {
        font-weight: 600;
        letter-spacing: 0;
      }

      .btn-secondary {
        font-weight: 600;
        letter-spacing: 0;
        color: var(--pln-text-2) !important;
        border-color: rgba(0, 0, 0, 0.14) !important;
      }

      // ── KPI strip ─────────────────────────────────────────────────────────
      .kpi-strip {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 14px;
        margin-bottom: 24px;

        @media (max-width: 900px) {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      .kpi-skeleton {
        height: 96px;
        border-radius: 16px;
        background: linear-gradient(90deg, #f1f5f9 25%, #e8edf4 50%, #f1f5f9 75%);
        background-size: 400% 100%;
        animation: shimmer 1.6s ease infinite;
      }

      .kpi-card {
        background: #ffffff;
        border: 1px solid rgba(0, 0, 0, 0.07);
        border-radius: 16px;
        padding: 20px 20px 18px;
        display: flex;
        align-items: center;
        gap: 14px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        transition:
          box-shadow 0.18s,
          transform 0.18s;

        &:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          transform: translateY(-1px);
        }

        &--alert {
          border-color: rgba(220, 38, 38, 0.18);
          background: linear-gradient(
            145deg,
            #fff 60%,
            rgba(254, 242, 242, 0.6) 100%
          );
        }
      }

      .kpi-icon {
        width: 46px;
        height: 46px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        mat-icon {
          font-size: 22px;
          width: 22px;
          height: 22px;
        }

        &--blue {
          background: rgba(76, 104, 192, 0.1);
          color: #4c68c0;
        }
        &--violet {
          background: rgba(109, 40, 217, 0.08);
          color: #7c3aed;
        }
        &--amber {
          background: rgba(180, 83, 9, 0.1);
          color: #b45309;
        }
        &--green {
          background: rgba(5, 150, 105, 0.1);
          color: #059669;
        }
        &--red {
          background: rgba(220, 38, 38, 0.1);
          color: #dc2626;
        }
      }

      .kpi-body {
        min-width: 0;
      }

      .kpi-value {
        font-size: 2rem;
        font-weight: 800;
        color: var(--pln-text-1);
        letter-spacing: -0.04em;
        line-height: 1;
        margin-bottom: 4px;

        &--red {
          color: #dc2626;
        }
      }

      .kpi-label {
        font-size: 0.6875rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.07em;
        color: var(--pln-text-3);
        margin-bottom: 2px;
      }

      .kpi-sub {
        font-size: 0.75rem;
        color: var(--pln-text-3);
      }

      // ── Main grid ─────────────────────────────────────────────────────────
      .dash-grid {
        display: grid;
        grid-template-columns: 1fr 360px;
        gap: 20px;
        align-items: start;

        @media (max-width: 960px) {
          grid-template-columns: 1fr;
        }
      }

      // ── Panel ─────────────────────────────────────────────────────────────
      .panel {
        background: #ffffff;
        border: 1px solid rgba(0, 0, 0, 0.07);
        border-radius: 18px;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
        overflow: hidden;
      }

      .panel-hd {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        padding: 20px 22px 16px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      }

      .panel-title {
        margin: 0 0 3px;
        font-size: 0.9375rem;
        font-weight: 700;
        color: var(--pln-text-1);
        letter-spacing: -0.02em;
      }

      .panel-sub {
        margin: 0;
        font-size: 0.75rem;
        color: var(--pln-text-3);
      }

      .panel-viewall {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 0.8125rem;
        font-weight: 600;
        color: #4c68c0;
        text-decoration: none;
        white-space: nowrap;
        flex-shrink: 0;
        padding-top: 1px;
        transition: gap 0.15s;

        mat-icon {
          font-size: 15px;
          width: 15px;
          height: 15px;
          transition: transform 0.15s;
        }

        &:hover {
          text-decoration: none;

          mat-icon {
            transform: translateX(3px);
          }
        }
      }

      .panel-empty {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 40px 24px;

        &__icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(0, 0, 0, 0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--pln-text-3);

          mat-icon {
            font-size: 22px;
            width: 22px;
            height: 22px;
          }

          &--green {
            background: rgba(5, 150, 105, 0.08);
            color: #059669;
          }
        }

        &__title {
          margin: 0 0 3px;
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--pln-text-2);
        }

        &__sub {
          margin: 0;
          font-size: 0.8125rem;
          color: var(--pln-text-3);
          line-height: 1.5;
        }
      }

      // ── Project list ──────────────────────────────────────────────────────
      .proj-list {
        display: flex;
        flex-direction: column;
      }

      .proj-skeleton {
        height: 66px;
        background: linear-gradient(90deg, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%);
        background-size: 400% 100%;
        animation: shimmer 1.6s ease infinite;
        border-bottom: 1px solid rgba(0, 0, 0, 0.04);
      }

      .proj-row {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 22px;
        text-decoration: none;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        transition: background 0.13s;

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background: #f8fafc;
          text-decoration: none;
        }
      }

      .proj-color-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.9);
        outline: 1px solid rgba(0, 0, 0, 0.08);
      }

      .proj-content {
        flex: 1;
        min-width: 0;
      }

      .proj-row-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 7px;
      }

      .proj-name {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--pln-text-1);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
      }

      .proj-status-pill {
        font-size: 0.625rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 2px 8px;
        border-radius: 20px;
        white-space: nowrap;
        flex-shrink: 0;

        &.pill--active {
          background: var(--pln-status-active-bg);
          color: var(--pln-status-active-color);
        }
        &.pill--on_hold {
          background: var(--pln-status-hold-bg);
          color: var(--pln-status-hold-color);
        }
        &.pill--completed {
          background: var(--pln-status-done-bg);
          color: var(--pln-status-done-color);
        }
        &.pill--archived {
          background: var(--pln-status-archived-bg);
          color: var(--pln-status-archived-color);
        }
      }

      .proj-progress-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .prog-track {
        flex: 1;
        height: 4px;
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.07);
        overflow: hidden;
      }

      .prog-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.4s ease;
      }

      .prog-label {
        font-size: 0.6875rem;
        color: var(--pln-text-3);
        white-space: nowrap;
        flex-shrink: 0;
      }

      .prog-pct {
        font-size: 0.6875rem;
        font-weight: 700;
        color: var(--pln-text-3);
        white-space: nowrap;
        flex-shrink: 0;
        min-width: 30px;
        text-align: right;

        &--done {
          color: #059669;
        }
      }

      .proj-no-tasks {
        font-size: 0.75rem;
        color: var(--pln-text-3);
        font-style: italic;
      }

      // ── Focus panel ───────────────────────────────────────────────────────
      .focus-section {
        &__label {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 10px 22px 6px;
          font-size: 0.625rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--pln-text-3);

          mat-icon {
            font-size: 13px;
            width: 13px;
            height: 13px;
          }

          &--danger {
            color: #dc2626;
            background: rgba(220, 38, 38, 0.03);
          }
        }
      }

      // ── Task list ─────────────────────────────────────────────────────────
      .task-list {
        display: flex;
        flex-direction: column;
      }

      .task-skeleton {
        height: 50px;
        background: linear-gradient(90deg, #f8fafc 25%, #f1f5f9 50%, #f8fafc 75%);
        background-size: 400% 100%;
        animation: shimmer 1.6s ease infinite;
        border-bottom: 1px solid rgba(0, 0, 0, 0.04);
      }

      .task-row {
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 9px 18px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        transition: background 0.12s;

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background: #f8fafc;
        }

        &--done .task-name {
          text-decoration: line-through;
          color: var(--pln-text-3);
        }
      }

      .toggle-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        transition: background 0.1s;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }

        &--TODO mat-icon {
          color: #cbd5e1;
        }

        &--IN_PROGRESS mat-icon {
          color: #4c68c0;
        }

        &--DONE mat-icon {
          color: #059669;
        }

        &:hover {
          background: rgba(0, 0, 0, 0.05);
        }
      }

      .task-body {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 7px;
      }

      .task-name {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--pln-text-1);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
      }

      .task-due-badge {
        font-size: 0.6875rem;
        font-weight: 600;
        color: #dc2626;
        background: rgba(220, 38, 38, 0.08);
        border-radius: 6px;
        padding: 1px 6px;
        white-space: nowrap;
        flex-shrink: 0;
      }

      .prio-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        flex-shrink: 0;

        &--low {
          background: #86efac;
        }
        &--medium {
          background: #fbbf24;
        }
        &--high {
          background: #f87171;
        }
      }

      .panel-footer {
        padding: 10px 16px;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
      }

      .add-task-btn {
        font-size: 0.8125rem;
        font-weight: 600;
        color: #4c68c0 !important;
        padding: 0 4px;
      }
    `,
  ],
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

  // ── Project stats ─────────────────────────────────────────────────────────
  readonly totalProjects = computed(() => this.projects().length);
  readonly activeProjectsCount = computed(
    () => this.projects().filter((p) => p.status === 'active').length,
  );

  /** Per-project task stats: total & done counts */
  private readonly projectTaskStats = computed(() => {
    const stats = new Map<string, { total: number; done: number }>();
    for (const task of this.allTasks()) {
      if (!task.projectId) continue;
      const s = stats.get(task.projectId) ?? { total: 0, done: 0 };
      s.total++;
      if (task.status === 'DONE') s.done++;
      stats.set(task.projectId, s);
    }
    return stats;
  });

  /** Recent 6 projects with task progress */
  readonly projectsWithStats = computed(() =>
    [...this.projects()]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 6)
      .map((p) => {
        const s = this.projectTaskStats().get(p.id) ?? { total: 0, done: 0 };
        return {
          ...p,
          total: s.total,
          done: s.done,
          pct: s.total > 0 ? Math.round((s.done / s.total) * 100) : 0,
        };
      }),
  );

  // ── Task stats ────────────────────────────────────────────────────────────
  readonly openTasks = computed(
    () => this.allTasks().filter((t) => t.status === 'TODO' || t.status === 'IN_PROGRESS').length,
  );
  readonly inProgressCount = computed(
    () => this.allTasks().filter((t) => t.status === 'IN_PROGRESS').length,
  );
  readonly dueTodayCount = computed(
    () =>
      this.allTasks().filter(
        (t) => t.dueDate?.slice(0, 10) === this.todayStr && t.status !== 'DONE',
      ).length,
  );
  readonly completedTodayCount = computed(
    () =>
      this.allTasks().filter(
        (t) => t.dueDate?.slice(0, 10) === this.todayStr && t.status === 'DONE',
      ).length,
  );
  readonly overdueCount = computed(
    () =>
      this.allTasks().filter(
        (t) => t.dueDate && t.dueDate.slice(0, 10) < this.todayStr && t.status !== 'DONE',
      ).length,
  );
  readonly upcomingCount = computed(
    () =>
      this.allTasks().filter(
        (t) => (t.dueDate?.slice(0, 10) ?? '') > this.todayStr && t.status !== 'DONE',
      ).length,
  );

  /** Overdue tasks sorted oldest-first, capped at 5 */
  readonly overdueTasks = computed(() =>
    this.allTasks()
      .filter((t) => t.dueDate && t.dueDate.slice(0, 10) < this.todayStr && t.status !== 'DONE')
      .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
      .slice(0, 5),
  );

  /** Tasks due today sorted by status (TODO → IN_PROGRESS → DONE), capped at 8 */
  readonly todayTasks = computed(() =>
    this.allTasks()
      .filter((t) => t.dueDate?.slice(0, 10) === this.todayStr)
      .sort((a, b) => {
        const order: Record<TaskStatus, number> = { TODO: 0, IN_PROGRESS: 1, DONE: 2 };
        return order[a.status] - order[b.status];
      })
      .slice(0, 8),
  );

  // ── Greeting ──────────────────────────────────────────────────────────────
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
    ({ active: 'Active', on_hold: 'On hold', completed: 'Done', archived: 'Archived' })[status] ??
    status;

  cycleStatus(task: Task): void {
    const next: Record<TaskStatus, TaskStatus> = {
      TODO: 'IN_PROGRESS',
      IN_PROGRESS: 'DONE',
      DONE: 'TODO',
    };
    this.tasksStore.update(task.id, { status: next[task.status] }).subscribe();
  }

  openCreateTask(): void {
    this.dialog.open(TaskFormDialogComponent, {
      data: { task: null, defaultDueDate: this.todayStr },
      autoFocus: 'first-tabbable',
      width: '520px',
    });
  }

  openCreateProject(): void {
    this.dialog.open(ProjectFormDialogComponent, {
      autoFocus: 'first-tabbable',
      width: '480px',
    });
  }

  openAllProjects(): void {
    this.dialog.open(AllProjectsDialogComponent, {
      data: this.projects(),
      width: '520px',
      autoFocus: false,
    });
  }

  ngOnInit(): void {
    this.store.load();
    this.tasksStore.load();
  }
}
