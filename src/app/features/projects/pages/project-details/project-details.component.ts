import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { ProjectsApiService } from '../../data-access/projects-api.service';
import { EditProjectDialogComponent } from '../../components/edit-project-dialog/edit-project-dialog.component';
import { Project } from '../../models/project.models';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    TitleCasePipe,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
  ],
  template: `
    <a routerLink="/projects" class="back-link">
      <mat-icon>arrow_back</mat-icon>
      All projects
    </a>

    @if (loading()) {
      <div class="loading-center" style="margin-top: 48px;">
        <mat-spinner diameter="40" />
      </div>
    } @else if (error()) {
      <div class="flex flex-col items-center gap-4 mt-12 text-center">
        <p class="text-muted">{{ error() }}</p>
        <a mat-stroked-button routerLink="/projects">Back to projects</a>
      </div>
    } @else if (project()) {
      <app-page-header [title]="project()!.name" [subtitle]="project()!.description ?? ''">
        <button mat-stroked-button (click)="openEdit()">
          <mat-icon>edit</mat-icon>
          Edit
        </button>
      </app-page-header>

      <div class="project-meta">
        <span class="meta-item">
          <mat-icon class="meta-icon">calendar_today</mat-icon>
          Created {{ project()!.createdAt | date: 'mediumDate' }}
        </span>
        <span
          class="status-dot"
          [style.background]="project()!.color ?? 'var(--mat-sys-primary)'"
        ></span>
        <span>{{ project()!.status | titlecase }}</span>
      </div>

      <p class="text-muted tasks-placeholder">
        Task list for this project will appear here in Increment 5.
      </p>
    }
  `,
  styles: [
    `
      .back-link {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.875rem;
        color: var(--mat-sys-on-surface-variant);
        text-decoration: none;
        margin-bottom: 4px;
        padding: 4px 0;
        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
        &:hover {
          color: var(--mat-sys-primary);
        }
      }

      .project-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: -8px 0 28px;
        font-size: 0.8125rem;
        color: var(--mat-sys-on-surface-variant);
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: 5px;
      }
      .meta-icon {
        font-size: 15px;
        width: 15px;
        height: 15px;
      }
      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .tasks-placeholder {
        margin-top: 48px;
        text-align: center;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ProjectsApiService);
  private readonly dialog = inject(MatDialog);

  readonly project = signal<Project | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

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
}
