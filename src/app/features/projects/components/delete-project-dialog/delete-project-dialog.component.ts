import { Component, ChangeDetectionStrategy, inject, Inject, signal } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectsStore } from '../../data-access/projects.store';
import { Project } from '../../models/project.models';

@Component({
  selector: 'app-delete-project-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatProgressSpinnerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dialog-shell dialog-enter">
      <div class="dialog-header">
        <div class="dialog-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
              stroke="currentColor"
              stroke-width="1.75"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <div>
          <h2 class="dialog-title">Delete project?</h2>
          <p class="dialog-sub">
            <strong>{{ project.name }}</strong> will be permanently deleted. This cannot be undone.
          </p>
        </div>
      </div>

      @if (error()) {
        <div
          class="mx-6 mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700"
        >
          {{ error() }}
        </div>
      }

      <div class="dialog-actions">
        <button mat-stroked-button (click)="dialogRef.close(false)" [disabled]="deleting()">
          Cancel
        </button>
        <button mat-flat-button color="warn" (click)="confirm()" [disabled]="deleting()">
          @if (deleting()) {
            <mat-spinner diameter="18" />
          } @else {
            Delete
          }
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-shell {
        width: 420px;
        max-width: 100%;
      }

      .dialog-header {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 24px 24px 20px;
      }

      .dialog-icon {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: #fef2f2;
        color: #dc2626;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .dialog-title {
        margin: 0 0 4px;
        font-size: 1rem;
        font-weight: 700;
        color: var(--mat-sys-on-surface);
      }

      .dialog-sub {
        margin: 0;
        font-size: 0.8125rem;
        color: var(--mat-sys-on-surface-variant);
        line-height: 1.5;
      }

      .dialog-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 0 24px 24px;
      }
    `,
  ],
})
export class DeleteProjectDialogComponent {
  readonly dialogRef = inject(MatDialogRef<DeleteProjectDialogComponent>);
  private readonly store = inject(ProjectsStore);
  readonly project: Project = inject(MAT_DIALOG_DATA);

  readonly deleting = signal(false);
  readonly error = signal<string | null>(null);

  confirm(): void {
    if (this.deleting()) return;
    this.deleting.set(true);
    this.error.set(null);

    this.store.delete(this.project.id).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => {
        this.error.set(this.store['_state$'].value.saveError);
        this.deleting.set(false);
      },
    });
  }
}
