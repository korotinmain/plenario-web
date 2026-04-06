import { Component, ChangeDetectionStrategy, inject, OnInit, computed } from '@angular/core';
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
import { TaskFormDialogComponent } from '../../components/task-form-dialog/task-form-dialog.component';
import { DeleteTaskDialogComponent } from '../../components/delete-task-dialog/delete-task-dialog.component';
import { Task, TaskStatus, TaskPriority } from '../../models/task.models';

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

/** Groups tasks by their dueDate (YYYY-MM-DD string) */
function groupByDate(tasks: Task[]): { date: string; tasks: Task[] }[] {
  const map = new Map<string, Task[]>();
  for (const t of tasks) {
    const key = t.dueDate!.slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, tasks]) => ({ date, tasks }));
}

@Component({
  selector: 'app-tasks-upcoming',
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
    <app-page-header title="Upcoming" subtitle="Tasks due after today, sorted by date">
      <button mat-flat-button (click)="openCreate()">
        <mat-icon>add</mat-icon>
        New task
      </button>
    </app-page-header>

    @if (loading()) {
      <div class="task-list stagger-cards">
        @for (_ of [1, 2, 3]; track $index) {
          <div class="task-skeleton">
            <div
              class="skeleton"
              style="width:22px;height:22px;border-radius:50%;flex-shrink:0"
            ></div>
            <div style="flex:1;display:flex;flex-direction:column;gap:6px">
              <div class="skeleton skeleton-text" style="width:55%"></div>
            </div>
            <div class="skeleton" style="width:60px;height:22px;border-radius:20px"></div>
          </div>
        }
      </div>
    } @else if (upcomingGroups().length === 0) {
      <app-empty-state
        icon="event"
        title="Nothing upcoming"
        message="No tasks with future due dates. Stay ahead by planning your next steps."
      >
        <button mat-flat-button (click)="openCreate()">
          <mat-icon>add</mat-icon>
          New task
        </button>
      </app-empty-state>
    } @else {
      @for (group of upcomingGroups(); track group.date) {
        <h2 class="date-label">{{ group.date | date: 'EEEE, MMMM d' }}</h2>
        <div class="task-list">
          @for (task of group.tasks; track task.id) {
            <div class="task-row">
              <button
                class="task-status-btn"
                [class]="'task-status-btn--' + task.status.toLowerCase()"
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
              <div class="task-content" [class.task-content--done]="task.status === 'DONE'">
                <span class="task-title">{{ task.title }}</span>
                @if (task.description) {
                  <span class="task-desc">{{ task.description }}</span>
                }
              </div>
              <span class="priority-chip" [class]="'priority-chip--' + task.priority.toLowerCase()">
                {{ priorityLabel(task.priority) }}
              </span>
              <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Task options">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="openEdit(task)">
                  <mat-icon>edit</mat-icon><span>Edit</span>
                </button>
                <button mat-menu-item class="menu-delete" (click)="openDelete(task)">
                  <mat-icon>delete_outline</mat-icon><span>Delete</span>
                </button>
              </mat-menu>
            </div>
          }
        </div>
      }
    }
  `,
  styles: [
    `
      :host {
        display: block;
        animation: fadeInUp 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      .date-label {
        margin: 0 0 8px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: var(--pln-text-3, #71717a);
        &:not(:first-child) {
          margin-top: 20px;
        }
      }

      .task-list {
        display: flex;
        flex-direction: column;
        background: var(--pln-card-bg, #fff);
        border: 1px solid var(--pln-card-border, #e4e4e7);
        border-radius: 16px;
        overflow: hidden;
        box-shadow: var(--pln-card-shadow);
        margin-bottom: 4px;
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

      .priority-chip {
        flex-shrink: 0;
        padding: 2px 9px;
        border-radius: 20px;
        font-size: 0.6875rem;
        font-weight: 600;
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

      .menu-delete {
        color: #dc2626;
      }
    `,
  ],
})
export class TasksUpcomingComponent implements OnInit {
  private readonly store = inject(TasksStore);
  private readonly dialog = inject(MatDialog);

  readonly loading = toSignal(this.store.state$.pipe(map((s) => s.loading)), {
    initialValue: true,
  });
  private readonly allTasks = toSignal(this.store.state$.pipe(map((s) => s.tasks)), {
    initialValue: [],
  });

  private readonly todayStr = new Date().toISOString().slice(0, 10);

  readonly upcomingGroups = computed(() => {
    const future = this.allTasks().filter(
      (t) => t.dueDate && t.dueDate.slice(0, 10) > this.todayStr && t.status !== 'DONE',
    );
    return groupByDate(future);
  });

  readonly priorityLabel = (p: TaskPriority) => PRIORITY_LABELS[p] ?? p;

  ngOnInit(): void {
    this.store.load();
  }

  cycleStatus(task: Task): void {
    const next: Record<TaskStatus, TaskStatus> = {
      TODO: 'IN_PROGRESS',
      IN_PROGRESS: 'DONE',
      DONE: 'TODO',
    };
    this.store.update(task.id, { status: next[task.status] }).subscribe();
  }

  openCreate(): void {
    this.dialog.open(TaskFormDialogComponent, { data: {}, autoFocus: 'first-tabbable' });
  }

  openEdit(task: Task): void {
    this.dialog.open(TaskFormDialogComponent, { data: { task }, autoFocus: 'first-tabbable' });
  }

  openDelete(task: Task): void {
    this.dialog.open(DeleteTaskDialogComponent, { data: task });
  }
}
