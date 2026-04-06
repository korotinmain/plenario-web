import { Component, ChangeDetectionStrategy, inject, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { StatCardComponent } from '../../../../shared/ui/stat-card/stat-card.component';
import { ProjectsStore } from '../../../projects/data-access/projects.store';
import { AuthService } from '../../../../core/auth/auth.service';

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
    <div class="stats-grid">
      <app-stat-card
        label="All projects"
        [value]="totalProjects()"
        icon="folder_open"
        gradient="violet"
      />
      <app-stat-card
        label="Active"
        [value]="activeProjects()"
        icon="play_circle"
        gradient="emerald"
      />
      <app-stat-card
        label="Completed"
        [value]="completedProjects()"
        icon="check_circle"
        gradient="blue"
      />
      <app-stat-card
        label="On hold"
        [value]="onHoldProjects()"
        icon="pause_circle"
        gradient="amber"
      />
    </div>

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
        @if (recentProjects().length === 0) {
          <div class="panel-empty">
            <mat-icon class="panel-empty-icon">folder_open</mat-icon>
            <span>No projects yet — create your first one.</span>
          </div>
        } @else {
          <div class="project-list">
            @for (p of recentProjects(); track p.id) {
              <a [routerLink]="['/projects', p.id]" class="project-row">
                <span class="project-row__dot" [style.background]="p.color ?? '#6366F1'"></span>
                <span class="project-row__name">{{ p.name }}</span>
                <span class="pstatus" [class]="'pstatus--' + p.status">
                  {{ statusLabel(p.status) }}
                </span>
              </a>
            }
          </div>
        }
      </div>

      <!-- Quick actions -->
      <div class="panel">
        <div class="panel-header">
          <h2 class="panel-title">Quick actions</h2>
        </div>
        <div class="qa-list">
          <a routerLink="/projects" class="qa-item">
            <div class="qa-icon qa-icon--violet">
              <mat-icon>folder_open</mat-icon>
            </div>
            <div class="qa-text">
              <span class="qa-label">Projects</span>
              <span class="qa-desc">Manage your projects</span>
            </div>
            <mat-icon class="qa-arrow">chevron_right</mat-icon>
          </a>
          <a routerLink="/tasks" class="qa-item">
            <div class="qa-icon qa-icon--blue">
              <mat-icon>task_alt</mat-icon>
            </div>
            <div class="qa-text">
              <span class="qa-label">Tasks</span>
              <span class="qa-desc">View and manage tasks</span>
            </div>
            <mat-icon class="qa-arrow">chevron_right</mat-icon>
          </a>
          <a routerLink="/settings" class="qa-item">
            <div class="qa-icon qa-icon--slate">
              <mat-icon>settings</mat-icon>
            </div>
            <div class="qa-text">
              <span class="qa-label">Settings</span>
              <span class="qa-desc">Account preferences</span>
            </div>
            <mat-icon class="qa-arrow">chevron_right</mat-icon>
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
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
        color: #6366f1;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
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

      // ── Quick actions ──────────────────────────────────────────────────────
      .qa-list {
        display: flex;
        flex-direction: column;
      }

      .qa-item {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px 20px;
        text-decoration: none;
        border-bottom: 1px solid var(--pln-card-border, #e4e4e7);
        transition: background 0.13s;

        &:last-child {
          border-bottom: none;
        }
        &:hover {
          background: #f9f9fb;
          .qa-arrow {
            color: #6366f1;
            transform: translateX(2px);
          }
        }
      }

      .qa-icon {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }

        &--violet {
          background: rgba(99, 102, 241, 0.1);
          mat-icon {
            color: #6366f1;
          }
        }
        &--blue {
          background: rgba(59, 130, 246, 0.1);
          mat-icon {
            color: #3b82f6;
          }
        }
        &--slate {
          background: rgba(100, 116, 139, 0.1);
          mat-icon {
            color: #64748b;
          }
        }
      }

      .qa-text {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .qa-label {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--pln-text-1, #18181b);
      }

      .qa-desc {
        font-size: 0.8125rem;
        color: var(--pln-text-3, #71717a);
      }

      .qa-arrow {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: var(--pln-text-4, #a1a1aa);
        transition:
          color 0.13s,
          transform 0.13s;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private readonly store = inject(ProjectsStore);
  private readonly authService = inject(AuthService);

  readonly today = new Date();
  readonly user = toSignal(this.authService.user$);

  private readonly projects = toSignal(this.store.state$.pipe(map((s) => s.projects)), {
    initialValue: [],
  });

  readonly totalProjects = computed(() => this.projects().length);
  readonly activeProjects = computed(
    () => this.projects().filter((p) => p.status === 'active').length,
  );
  readonly completedProjects = computed(
    () => this.projects().filter((p) => p.status === 'completed').length,
  );
  readonly onHoldProjects = computed(
    () => this.projects().filter((p) => p.status === 'on_hold').length,
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

  ngOnInit(): void {
    this.store.load();
  }
}
