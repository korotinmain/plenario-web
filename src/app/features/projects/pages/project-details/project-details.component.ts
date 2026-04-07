import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, NgTemplateOutlet, TitleCasePipe } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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
import { Task, TaskStatus } from '../../../tasks/models/task.models';

const STATUS_META: Record<
  ProjectStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  active: { label: 'Active', bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
  on_hold: { label: 'On Hold', bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
  completed: { label: 'Completed', bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  archived: { label: 'Archived', bg: '#f4f4f5', text: '#71717a', border: '#e4e4e7' },
};

const PRIORITY_META: Record<string, { bg: string; text: string; dot: string }> = {
  LOW: { bg: '#f0f9ff', text: '#0369a1', dot: '#38bdf8' },
  MEDIUM: { bg: '#fffbeb', text: '#92400e', dot: '#f59e0b' },
  HIGH: { bg: '#fff1f2', text: '#be123c', dot: '#f43f5e' },
};

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    NgTemplateOutlet,
    TitleCasePipe,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        display: block;
        animation: fadeInUp 0.24s cubic-bezier(0.22, 1, 0.36, 1) both;
      }
      .status-btn {
        transition: transform 0.12s ease;
      }
      .status-btn:active {
        transform: scale(0.88);
      }
      .task-row:hover .task-actions {
        opacity: 1;
      }
      .task-actions {
        opacity: 0;
        transition: opacity 0.15s;
      }
      /* Two-column layout */
      .proj-content-grid {
        display: grid;
        grid-template-columns: 1fr 280px;
        gap: 16px;
        align-items: start;
      }
      @media (max-width: 900px) {
        .proj-content-grid {
          grid-template-columns: 1fr;
        }
      }
      .proj-tasks-col {
        min-width: 0;
      }
      /* Context panel cards */
      .proj-context-col {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .ctx-card {
        background: #fff;
        border: 1px solid rgba(0,0,0,0.07);
        border-radius: 14px;
        padding: 14px 16px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      }
      .ctx-card-hd {
        display: flex;
        align-items: center;
        gap: 7px;
        margin-bottom: 10px;
      }
      .ctx-card-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
      .ctx-card-title {
        margin: 0;
        font-size: 0.8125rem;
        font-weight: 700;
        color: #1e293b;
        letter-spacing: -0.01em;
      }
      .ctx-empty-text {
        margin: 0;
        font-size: 0.75rem;
        color: #94a3b8;
      }
      .ctx-next-task {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .ctx-next-task-name {
        font-size: 0.875rem;
        font-weight: 600;
        color: #1e293b;
        line-height: 1.3;
      }
      .ctx-next-task-date {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        color: #64748b;

        mat-icon {
          font-size: 13px;
          width: 13px;
          height: 13px;
        }

        &--overdue {
          color: #dc2626;
        }
      }
      .ctx-activity-list {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .ctx-activity-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .ctx-activity-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #cbd5e1;
        flex-shrink: 0;

        &--done {
          background: #34d399;
        }
        &--active {
          background: #60a5fa;
        }
      }
      .ctx-activity-name {
        flex: 1;
        font-size: 0.8125rem;
        color: #334155;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ctx-activity-status {
        font-size: 0.6875rem;
        font-weight: 600;
        color: #94a3b8;
        white-space: nowrap;
        flex-shrink: 0;
      }
      .ctx-notes-text {
        margin: 0;
        font-size: 0.8125rem;
        color: #475569;
        line-height: 1.55;
      }
      .ctx-card--add {
        padding: 12px;
      }
      .ctx-add-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        width: 100%;
        height: 36px;
        border-radius: 10px;
        border: none;
        color: #fff;
        font-size: 0.8125rem;
        font-weight: 600;
        cursor: pointer;
        transition: filter 0.15s;

        mat-icon {
          font-size: 16px;
          width: 16px;
          height: 16px;
        }

        &:hover {
          filter: brightness(1.08);
        }
      }
      .ctx-insights {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .ctx-insight-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .ctx-insight-label {
        font-size: 0.75rem;
        color: #94a3b8;
      }
      .ctx-insight-val {
        font-size: 0.8125rem;
        font-weight: 700;
        color: #1e293b;

        &--good {
          color: #059669;
        }
        &--danger {
          color: #dc2626;
        }
      }
    `,
  ],
  template: `
    <!-- ── Breadcrumb ───────────────────────────────────────────────────────── -->
    <div class="flex items-center gap-2 mb-6">
      <button
        (click)="goBack()"
        class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg
               text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors text-sm font-medium"
      >
        <mat-icon style="font-size:16px;width:16px;height:16px;line-height:1">arrow_back</mat-icon>
        Projects
      </button>
      @if (project()) {
        <mat-icon class="text-slate-300" style="font-size:14px;width:14px;height:14px;line-height:1"
          >chevron_right</mat-icon
        >
        <span class="text-sm font-medium text-slate-800 truncate max-w-[220px]">{{
          project()!.name
        }}</span>
      }
    </div>

    <!-- ── Loading ──────────────────────────────────────────────────────────── -->
    @if (loading()) {
      <div class="flex items-center justify-center py-24">
        <div
          class="w-10 h-10 rounded-full border-[3px] border-slate-200 border-t-[#4c68c0] animate-spin"
        ></div>
      </div>

      <!-- ── Error ─────────────────────────────────────────────────────────────── -->
    } @else if (error()) {
      <div class="flex flex-col items-center justify-center py-20 text-center">
        <div
          class="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-4"
        >
          <mat-icon class="text-red-400" style="font-size:28px;width:28px;height:28px"
            >error_outline</mat-icon
          >
        </div>
        <h3 class="text-lg font-bold text-slate-900 mb-1">Project not found</h3>
        <p class="text-sm text-slate-400 mb-5">{{ error() }}</p>
        <button
          routerLink="/dashboard"
          class="px-4 py-2 bg-[#4c68c0] hover:bg-[#3b5cb0] text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

      <!-- ── Content ───────────────────────────────────────────────────────────── -->
    } @else if (project()) {
      <!-- Project header card -->
      <div class="rounded-2xl border border-slate-100 shadow-sm mb-5 overflow-hidden">
        <!-- Colored header section -->
        <div class="relative px-7 py-6" [style.background]="project()!.color ?? '#4c68c0'">
          <div class="absolute inset-0 bg-gradient-to-br from-white/[0.10] to-black/[0.14]"></div>
          <div class="relative flex items-center justify-between gap-4">
            <!-- Icon + Title -->
            <div class="flex items-center gap-4 min-w-0">
              <div
                class="w-12 h-12 rounded-xl bg-white/20 border border-white/30
                          flex items-center justify-center flex-shrink-0"
              >
                <mat-icon
                  class="text-white"
                  style="font-size:24px;width:24px;height:24px;line-height:1"
                >
                  folder_open
                </mat-icon>
              </div>
              <h1
                class="text-[1.5rem] font-extrabold text-white tracking-tight leading-tight truncate"
              >
                {{ project()!.name }}
              </h1>
            </div>
            <!-- Status + Edit -->
            <div class="flex items-center gap-2.5 flex-shrink-0">
              <span
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold
                           uppercase tracking-wider bg-white/20 border border-white/30 text-white"
              >
                {{ statusMeta(project()!.status).label }}
              </span>
              <button
                (click)="openEdit()"
                class="flex items-center gap-1.5 px-3.5 h-8 rounded-xl bg-white/20 border border-white/30
                             hover:bg-white/30 text-white text-sm font-semibold transition-colors"
              >
                <mat-icon style="font-size:15px;width:15px;height:15px;line-height:1"
                  >edit</mat-icon
                >
                Edit
              </button>
            </div>
          </div>
        </div>

        <!-- White body: description + meta -->
        <div class="bg-white px-7 py-5">
          @if (project()!.description) {
            <p class="text-[0.9375rem] text-slate-500 leading-relaxed mb-4 max-w-2xl">
              {{ project()!.description }}
            </p>
          }
          <div class="flex items-center gap-2 flex-wrap">
            <span
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50
                         border border-slate-100 text-xs font-medium text-slate-500"
            >
              <mat-icon style="font-size:12px;width:12px;height:12px;line-height:1"
                >calendar_today</mat-icon
              >
              Created {{ project()!.createdAt | date: 'MMM d, y' }}
            </span>
            <span
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50
                         border border-slate-100 text-xs font-medium text-slate-500"
            >
              <mat-icon style="font-size:12px;width:12px;height:12px;line-height:1"
                >update</mat-icon
              >
              Updated {{ project()!.updatedAt | date: 'MMM d, y' }}
            </span>
          </div>
        </div>
      </div>

      <!-- ── Stats strip ─────────────────────────────────────────────────────── -->
      <div class="grid grid-cols-4 gap-3 mb-5">
        <!-- Total -->
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <p class="text-[0.625rem] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
            Total
          </p>
          <p class="text-2xl font-extrabold text-slate-900 leading-none">{{ totalCount() }}</p>
          <p class="text-xs text-slate-400 mt-1">tasks</p>
        </div>
        <!-- Done -->
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <p class="text-[0.625rem] font-bold uppercase tracking-widest text-emerald-500 mb-1.5">
            Done
          </p>
          <p class="text-2xl font-extrabold text-slate-900 leading-none">
            {{ doneTasks().length }}
          </p>
          <p class="text-xs text-slate-400 mt-1">{{ progressPct() }}% complete</p>
        </div>
        <!-- In Progress -->
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <p class="text-[0.625rem] font-bold uppercase tracking-widest text-blue-500 mb-1.5">
            In Progress
          </p>
          <p class="text-2xl font-extrabold text-slate-900 leading-none">
            {{ inProgressTasks().length }}
          </p>
          <p class="text-xs text-slate-400 mt-1">active now</p>
        </div>
        <!-- Overdue -->
        <div
          class="rounded-xl border shadow-sm p-4"
          [class]="overdueCount() > 0 ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100'"
        >
          <p
            class="text-[0.625rem] font-bold uppercase tracking-widest mb-1.5"
            [class]="overdueCount() > 0 ? 'text-red-400' : 'text-slate-400'"
          >
            Overdue
          </p>
          <p
            class="text-2xl font-extrabold leading-none"
            [class]="overdueCount() > 0 ? 'text-red-600' : 'text-slate-900'"
          >
            {{ overdueCount() }}
          </p>
          <p class="text-xs mt-1" [class]="overdueCount() > 0 ? 'text-red-400' : 'text-slate-400'">
            past due date
          </p>
        </div>
      </div>

      <!-- Progress bar -->
      @if (totalCount() > 0) {
        <div class="bg-white rounded-xl border border-slate-100 shadow-sm px-5 py-4 mb-5">
          <div class="flex items-center justify-between mb-2.5">
            <span class="text-sm font-semibold text-slate-700">Progress</span>
            <span
              class="text-sm font-bold"
              [class]="progressPct() === 100 ? 'text-emerald-600' : 'text-slate-500'"
            >
              {{ progressPct() }}%
            </span>
          </div>
          <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-500 ease-out"
              [style.width.%]="progressPct()"
              [style.background]="
                progressPct() === 100 ? '#059669' : (project()!.color ?? '#4c68c0')
              "
            ></div>
          </div>
          @if (progressPct() === 100) {
            <p class="text-xs text-emerald-600 font-medium mt-2">🎉 All tasks complete!</p>
          }
        </div>
      }

      <!-- ── Two-column content grid ─────────────────────────────────────────── -->
      <div class="proj-content-grid">
        <!-- ── Left column: Tasks ─────────────────────────────────────────────── -->
        <div class="proj-tasks-col">
      <!-- ── Tasks section ───────────────────────────────────────────────────── -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <!-- Section header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              [style.background]="(project()!.color ?? '#4c68c0') + '18'"
            >
              <mat-icon
                [style.color]="project()!.color ?? '#4c68c0'"
                style="font-size:17px;width:17px;height:17px;line-height:1"
                >task_alt</mat-icon
              >
            </div>
            <h2 class="text-[0.9375rem] font-bold text-slate-900 tracking-tight">Tasks</h2>
            @if (totalCount() > 0) {
              <span
                class="px-2 py-0.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-500"
              >
                {{ totalCount() }}
              </span>
            }
          </div>
          <button
            (click)="openCreateTask()"
            class="flex items-center gap-1.5 px-4 h-8 rounded-lg bg-[#4c68c0] hover:bg-[#3b5cb0]
                         text-white text-xs font-semibold transition-colors"
          >
            <mat-icon style="font-size:14px;width:14px;height:14px;line-height:1">add</mat-icon>
            Add task
          </button>
        </div>

        <!-- Task list loading skeletons -->
        @if (tasksLoading()) {
          @for (_ of [1, 2, 3]; track $index) {
            <div class="flex items-center gap-3 px-6 py-3.5 border-b border-slate-50 last:border-0">
              <div class="w-5 h-5 rounded-full bg-slate-100 animate-pulse flex-shrink-0"></div>
              <div class="flex-1 space-y-1.5">
                <div class="h-3.5 bg-slate-100 rounded animate-pulse" style="width:52%"></div>
                <div class="h-2.5 bg-slate-50 rounded animate-pulse" style="width:28%"></div>
              </div>
              <div class="h-5 w-14 bg-slate-100 rounded-full animate-pulse"></div>
            </div>
          }

          <!-- Empty state -->
        } @else if (projectTasks().length === 0) {
          <div class="flex flex-col items-center py-14 text-center px-6">
            <div
              class="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              [style.background]="(project()!.color ?? '#4c68c0') + '15'"
            >
              <mat-icon
                [style.color]="project()!.color ?? '#4c68c0'"
                style="font-size:28px;width:28px;height:28px"
                >task_alt</mat-icon
              >
            </div>
            <p class="text-sm font-semibold text-slate-700 mb-1">No tasks yet</p>
            <p class="text-xs text-slate-400 mb-4">
              Add tasks to start tracking progress on this project.
            </p>
            <button
              (click)="openCreateTask()"
              class="flex items-center gap-1.5 px-4 h-8 rounded-lg bg-[#4c68c0] hover:bg-[#3b5cb0]
                           text-white text-xs font-semibold transition-colors"
            >
              <mat-icon style="font-size:14px;width:14px;height:14px;line-height:1">add</mat-icon>
              Create first task
            </button>
          </div>
        } @else {
          <!-- ── In Progress group ─────────────────────────────────────────── -->
          @if (inProgressTasks().length > 0) {
            <div class="border-b border-slate-100">
              <div class="flex items-center gap-2 px-6 py-2.5 bg-blue-50/60">
                <span class="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0"></span>
                <span class="text-xs font-bold uppercase tracking-wider text-blue-500">
                  In Progress
                </span>
                <span class="ml-auto text-xs font-semibold text-blue-400">{{
                  inProgressTasks().length
                }}</span>
              </div>
              @for (task of inProgressTasks(); track task.id) {
                <ng-container
                  *ngTemplateOutlet="taskRow; context: { $implicit: task }"
                ></ng-container>
              }
            </div>
          }

          <!-- ── To Do group ───────────────────────────────────────────────── -->
          @if (todoTasks().length > 0) {
            <div [class]="inProgressTasks().length > 0 ? 'border-b border-slate-100' : ''">
              <div class="flex items-center gap-2 px-6 py-2.5 bg-slate-50/80">
                <span class="w-2 h-2 rounded-full bg-slate-400 flex-shrink-0"></span>
                <span class="text-xs font-bold uppercase tracking-wider text-slate-400">To Do</span>
                <span class="ml-auto text-xs font-semibold text-slate-400">{{
                  todoTasks().length
                }}</span>
              </div>
              @for (task of todoTasks(); track task.id) {
                <ng-container
                  *ngTemplateOutlet="taskRow; context: { $implicit: task }"
                ></ng-container>
              }
            </div>
          }

          <!-- ── Done group (collapsible) ─────────────────────────────────── -->
          @if (doneTasks().length > 0) {
            <div>
              <button
                (click)="doneExpanded.set(!doneExpanded())"
                class="w-full flex items-center gap-2 px-6 py-2.5 bg-slate-50/50
                             hover:bg-slate-50 transition-colors"
              >
                <span class="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0"></span>
                <span class="text-xs font-bold uppercase tracking-wider text-emerald-600"
                  >Done</span
                >
                <span
                  class="ml-auto flex items-center gap-1.5 text-xs font-semibold text-slate-400"
                >
                  {{ doneTasks().length }}
                  <mat-icon
                    class="transition-transform duration-200"
                    style="font-size:14px;width:14px;height:14px;line-height:1"
                    [style.transform]="doneExpanded() ? 'rotate(0deg)' : 'rotate(-90deg)'"
                  >
                    expand_more
                  </mat-icon>
                </span>
              </button>
              @if (doneExpanded()) {
                @for (task of doneTasks(); track task.id) {
                  <ng-container
                    *ngTemplateOutlet="taskRow; context: { $implicit: task }"
                  ></ng-container>
                }
              }
            </div>
          }
        }
      </div>
        </div><!-- end proj-tasks-col -->

        <!-- ── Right column: Context panel ───────────────────────────────────── -->
        <div class="proj-context-col">
          <!-- Next due task -->
          <div class="ctx-card">
            <div class="ctx-card-hd">
              <mat-icon class="ctx-card-icon" [style.color]="project()!.color ?? '#4c68c0'">schedule</mat-icon>
              <h3 class="ctx-card-title">Next Due</h3>
            </div>
            @if (nextDueTask()) {
              <div class="ctx-next-task">
                <span class="ctx-next-task-name">{{ nextDueTask()!.title }}</span>
                <span class="ctx-next-task-date" [class.ctx-next-task-date--overdue]="isOverdue(nextDueTask()!)">
                  <mat-icon>{{ isOverdue(nextDueTask()!) ? 'warning_amber' : 'event' }}</mat-icon>
                  {{ nextDueTask()!.dueDate | date: 'MMM d' }}
                </span>
              </div>
            } @else {
              <p class="ctx-empty-text">No upcoming deadlines.</p>
            }
          </div>

          <!-- Recent activity -->
          <div class="ctx-card">
            <div class="ctx-card-hd">
              <mat-icon class="ctx-card-icon" [style.color]="project()!.color ?? '#4c68c0'">history</mat-icon>
              <h3 class="ctx-card-title">Recent Activity</h3>
            </div>
            @if (recentActivity().length === 0) {
              <p class="ctx-empty-text">No activity yet.</p>
            } @else {
              <div class="ctx-activity-list">
                @for (task of recentActivity(); track task.id) {
                  <div class="ctx-activity-row">
                    @if (task.status === 'DONE') {
                      <span class="ctx-activity-dot ctx-activity-dot--done"></span>
                    } @else if (task.status === 'IN_PROGRESS') {
                      <span class="ctx-activity-dot ctx-activity-dot--active"></span>
                    } @else {
                      <span class="ctx-activity-dot"></span>
                    }
                    <span class="ctx-activity-name">{{ task.title }}</span>
                    <span class="ctx-activity-status">{{ task.status | titlecase }}</span>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Project notes -->
          @if (project()!.description) {
            <div class="ctx-card">
              <div class="ctx-card-hd">
                <mat-icon class="ctx-card-icon" [style.color]="project()!.color ?? '#4c68c0'">notes</mat-icon>
                <h3 class="ctx-card-title">Notes</h3>
              </div>
              <p class="ctx-notes-text">{{ project()!.description }}</p>
            </div>
          }

          <!-- Quick add -->
          <div class="ctx-card ctx-card--add">
            <button
              (click)="openCreateTask()"
              class="ctx-add-btn"
              [style.background]="project()!.color ?? '#4c68c0'"
            >
              <mat-icon>add</mat-icon>
              Add task to project
            </button>
          </div>

          <!-- Lightweight insights -->
          <div class="ctx-card">
            <div class="ctx-card-hd">
              <mat-icon class="ctx-card-icon" [style.color]="project()!.color ?? '#4c68c0'">insights</mat-icon>
              <h3 class="ctx-card-title">Insights</h3>
            </div>
            <div class="ctx-insights">
              <div class="ctx-insight-row">
                <span class="ctx-insight-label">Completion</span>
                <span class="ctx-insight-val" [class.ctx-insight-val--good]="progressPct() >= 75">{{ progressPct() }}%</span>
              </div>
              <div class="ctx-insight-row">
                <span class="ctx-insight-label">Open tasks</span>
                <span class="ctx-insight-val">{{ todoTasks().length + inProgressTasks().length }}</span>
              </div>
              <div class="ctx-insight-row">
                <span class="ctx-insight-label">At risk</span>
                <span class="ctx-insight-val" [class.ctx-insight-val--danger]="overdueCount() > 0">{{ overdueCount() }}</span>
              </div>
              <div class="ctx-insight-row">
                <span class="ctx-insight-label">Updated</span>
                <span class="ctx-insight-val">{{ project()!.updatedAt | date: 'MMM d' }}</span>
              </div>
            </div>
          </div>
        </div><!-- end proj-context-col -->
      </div><!-- end proj-content-grid -->
    }

    <!-- ── Task row template ──────────────────────────────────────────────────── -->
    <ng-template #taskRow let-task>
      <div
        class="task-row group flex items-center gap-3 px-6 py-3.5 border-b border-slate-50
                  last:border-0 hover:bg-slate-50/60 transition-colors"
      >
        <!-- Status toggle -->
        <button
          class="status-btn flex-shrink-0 w-5 h-5 flex items-center justify-center"
          (click)="cycleStatus(task)"
          [title]="task.status"
        >
          @if (task.status === 'DONE') {
            <mat-icon
              class="text-emerald-500"
              style="font-size:20px;width:20px;height:20px;line-height:1"
            >
              check_circle
            </mat-icon>
          } @else if (task.status === 'IN_PROGRESS') {
            <mat-icon
              class="text-blue-500"
              style="font-size:20px;width:20px;height:20px;line-height:1"
            >
              pending
            </mat-icon>
          } @else {
            <mat-icon
              class="text-slate-300 hover:text-slate-400"
              style="font-size:20px;width:20px;height:20px;line-height:1"
            >
              radio_button_unchecked
            </mat-icon>
          }
        </button>

        <!-- Task info -->
        <div class="flex-1 min-w-0">
          <p
            class="text-sm font-medium leading-snug truncate"
            [class]="task.status === 'DONE' ? 'text-slate-400 line-through' : 'text-slate-800'"
          >
            {{ task.title }}
          </p>
          @if (task.dueDate) {
            <p
              class="flex items-center gap-1 text-xs mt-0.5"
              [class]="isOverdue(task) ? 'text-red-500' : 'text-slate-400'"
            >
              <mat-icon style="font-size:11px;width:11px;height:11px;line-height:1">
                {{ isOverdue(task) ? 'warning_amber' : 'schedule' }}
              </mat-icon>
              {{ task.dueDate | date: 'MMM d' }}
              @if (isOverdue(task)) {
                <span class="font-semibold">· overdue</span>
              }
            </p>
          }
        </div>

        <!-- Priority chip -->
        <span
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.6875rem] font-semibold flex-shrink-0"
          [style.background]="priorityMeta(task.priority).bg"
          [style.color]="priorityMeta(task.priority).text"
        >
          <span
            class="w-1.5 h-1.5 rounded-full flex-shrink-0"
            [style.background]="priorityMeta(task.priority).dot"
          ></span>
          {{ task.priority | titlecase }}
        </span>

        <!-- Actions (appear on hover) -->
        <div class="task-actions flex items-center gap-0.5 flex-shrink-0">
          <button
            (click)="openEditTask(task)"
            class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400
                         hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <mat-icon style="font-size:15px;width:15px;height:15px;line-height:1">edit</mat-icon>
          </button>
          <button
            (click)="openDeleteTask(task)"
            class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400
                         hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <mat-icon style="font-size:15px;width:15px;height:15px;line-height:1">delete</mat-icon>
          </button>
        </div>
      </div>
    </ng-template>
  `,
})
export class ProjectDetailsComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ProjectsApiService);
  private readonly dialog = inject(MatDialog);
  private readonly tasksStore = inject(TasksStore);
  private readonly destroy$ = new Subject<void>();

  readonly project = signal<Project | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly doneExpanded = signal(false);

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

  readonly todoTasks = computed(() => this.projectTasks().filter((t) => t.status === 'TODO'));
  readonly inProgressTasks = computed(() =>
    this.projectTasks().filter((t) => t.status === 'IN_PROGRESS'),
  );
  readonly doneTasks = computed(() => this.projectTasks().filter((t) => t.status === 'DONE'));
  readonly totalCount = computed(() => this.projectTasks().length);
  readonly progressPct = computed(() => {
    const total = this.totalCount();
    return total > 0 ? Math.round((this.doneTasks().length / total) * 100) : 0;
  });
  readonly overdueCount = computed(
    () => this.projectTasks().filter((t) => this.isOverdue(t)).length,
  );

  /** Next due task: earliest due, not done */
  readonly nextDueTask = computed(() => {
    const tasks = this.projectTasks()
      .filter((t) => t.status !== 'DONE' && t.dueDate)
      .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''));
    return tasks[0] ?? null;
  });

  /** Recent activity: last 5 tasks by updatedAt */
  readonly recentActivity = computed(() =>
    [...this.projectTasks()]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5),
  );

  statusMeta(status: ProjectStatus) {
    return STATUS_META[status] ?? STATUS_META.active;
  }

  priorityMeta(priority: string) {
    return PRIORITY_META[priority] ?? PRIORITY_META['MEDIUM'];
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

  goBack(): void {
    history.back();
  }

  ngOnInit(): void {
    // React to param changes so navigating between projects reloads the page
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = params.get('id')!;
      this.project.set(null);
      this.loading.set(true);
      this.error.set(null);
      this.doneExpanded.set(false);
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
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
