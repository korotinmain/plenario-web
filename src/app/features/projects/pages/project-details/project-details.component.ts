import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { ProjectsApiService } from '../../data-access/projects-api.service';
import { EditProjectDialogComponent } from '../../components/edit-project-dialog/edit-project-dialog.component';
import { Project, ProjectStatus } from '../../models/project.models';

const STATUS_MAP: Record<ProjectStatus, { label: string; cssClass: string }> = {
  active:    { label: 'Active',    cssClass: 'badge--active' },
  on_hold:   { label: 'On hold',   cssClass: 'badge--hold' },
  completed: { label: 'Completed', cssClass: 'badge--done' },
  archived:  { label: 'Archived',  cssClass: 'badge--archived' },
};

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [
    RouterLink, DatePipe, NgClass,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
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
        <div class="hero-card__banner" [style.background]="project()!.color ?? '#6366F1'">
          <div class="hero-card__banner-overlay"></div>
        </div>
        <div class="hero-card__body">
          <div class="hero-card__top">
            <div class="hero-card__icon-circle" [style.background]="project()!.color ?? '#6366F1'">
              <mat-icon>folder_open</mat-icon>
            </div>
            <div class="hero-card__actions">
              <span class="status-badge" [ngClass]="statusInfo(project()!.status).cssClass">
                {{ statusInfo(project()!.status).label }}
              </span>
              <button mat-flat-button (click)="openEdit()">
                <mat-icon>edit</mat-icon>Edit
              </button>
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
        </div>
        <div class="tasks-coming-soon">
          <div class="tcs-icon-wrap"><mat-icon>rocket_launch</mat-icon></div>
          <p class="tcs-text">Task management for this project is coming in Increment 5.</p>
        </div>
      </div>
    }
  `,
  styles: [`
    .back-nav {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 0.875rem; font-weight: 600; color: var(--pln-text-3,#71717A);
      text-decoration: none; margin-bottom: 24px; padding: 6px 10px 6px 6px;
      border-radius: 8px; transition: background .13s, color .13s;
      &:hover { background: rgba(0,0,0,.04); color: var(--pln-text-1,#18181B); text-decoration: none; }
    }
    .back-nav__icon { font-size: 18px; width: 18px; height: 18px; }

    .hero-card {
      background: var(--pln-card-bg,#fff); border: 1px solid var(--pln-card-border,#E4E4E7);
      border-radius: 20px; overflow: hidden; margin-bottom: 20px; box-shadow: var(--pln-card-shadow);
    }
    .hero-card__banner {
      height: 80px; position: relative; overflow: hidden;
    }
    .hero-card__banner-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(0,0,0,.08), rgba(255,255,255,.05));
    }
    .hero-card__body { padding: 0 28px 28px; }
    .hero-card__top {
      display: flex; align-items: flex-end; justify-content: space-between;
      margin-bottom: 16px; margin-top: -28px;
    }
    .hero-card__icon-circle {
      width: 56px; height: 56px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      border: 3px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,.12); flex-shrink: 0;
      mat-icon { color: #fff; font-size: 26px; width: 26px; height: 26px; }
    }
    .hero-card__actions { display: flex; align-items: center; gap: 10px; }
    .hero-card__title {
      margin: 0 0 8px; font-size: 1.75rem; font-weight: 800;
      color: var(--pln-text-1,#18181B); letter-spacing: -0.04em; line-height: 1.15;
    }
    .hero-card__desc {
      margin: 0 0 18px; font-size: .9375rem; color: var(--pln-text-3,#71717A);
      line-height: 1.65; max-width: 640px;
    }
    .hero-card__meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .meta-pill {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 10px; border-radius: 20px; background: #F4F4F5; border: 1px solid #E4E4E7;
      font-size: .75rem; font-weight: 500; color: var(--pln-text-3,#71717A);
      &__icon { font-size: 12px; width: 12px; height: 12px; }
    }
    .status-badge {
      display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 20px;
      font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .05em; white-space: nowrap;
      &.badge--active   { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
      &.badge--hold     { background: #FFFBEB; color: #B45309; border: 1px solid #FDE68A; }
      &.badge--done     { background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE; }
      &.badge--archived { background: #F4F4F5; color: #71717A; border: 1px solid #E4E4E7; }
    }
    .section-card {
      background: var(--pln-card-bg,#fff); border: 1px solid var(--pln-card-border,#E4E4E7);
      border-radius: 16px; overflow: hidden; box-shadow: var(--pln-card-shadow);
    }
    .section-card__header { padding: 16px 24px; border-bottom: 1px solid var(--pln-card-border,#E4E4E7); }
    .section-card__title {
      margin: 0; font-size: .9375rem; font-weight: 700; color: var(--pln-text-1,#18181B);
      letter-spacing: -.02em; display: flex; align-items: center; gap: 8px;
    }
    .section-icon { font-size: 18px; width: 18px; height: 18px; color: #6366F1; }
    .tasks-coming-soon {
      display: flex; align-items: center; gap: 14px;
      padding: 28px 24px; color: var(--pln-text-3,#71717A);
    }
    .tcs-icon-wrap {
      width: 40px; height: 40px; border-radius: 10px; background: rgba(99,102,241,.1);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      mat-icon { color: #6366F1; font-size: 20px; width: 20px; height: 20px; }
    }
    .tcs-text { margin: 0; font-size: .875rem; line-height: 1.55; }
    .loading-state { display: flex; justify-content: center; margin-top: 80px; }
    .error-card {
      background: var(--pln-card-bg,#fff); border: 1px solid var(--pln-card-border,#E4E4E7);
      border-radius: 20px; padding: 56px 40px; display: flex; flex-direction: column;
      align-items: center; text-align: center; max-width: 480px;
    }
    .error-card__icon-wrap {
      width: 56px; height: 56px; border-radius: 16px; background: #FEF2F2; border: 1px solid #FECACA;
      display: flex; align-items: center; justify-content: center; margin-bottom: 16px;
      mat-icon { color: #EF4444; font-size: 28px; width: 28px; height: 28px; }
    }
    .error-card__title { margin: 0 0 8px; font-size: 1.125rem; font-weight: 700; color: var(--pln-text-1,#18181B); }
    .error-card__text { margin: 0 0 24px; font-size: .875rem; color: var(--pln-text-3,#71717A); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ProjectsApiService);
  private readonly dialog = inject(MatDialog);

  readonly project = signal<Project | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  statusInfo(status: ProjectStatus) {
    return STATUS_MAP[status] ?? { label: status, cssClass: '' };
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getById(id).subscribe({
      next: (p) => { this.project.set(p); this.loading.set(false); },
      error: () => { this.error.set('Project not found.'); this.loading.set(false); },
    });
  }

  openEdit(): void {
    if (!this.project()) return;
    const ref = this.dialog.open(EditProjectDialogComponent, {
      data: this.project(), autoFocus: 'first-tabbable',
    });
    ref.afterClosed().subscribe((updated: Project | undefined) => {
      if (updated) this.project.set(updated);
    });
  }
}
