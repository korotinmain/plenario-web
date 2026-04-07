import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ProjectFormDialogComponent } from '../project-form-dialog/project-form-dialog.component';
import { Project, ProjectStatus } from '../../models/project.models';

const STATUS_LABEL: Record<ProjectStatus, string> = {
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Done',
  archived: 'Archived',
};

const STATUS_CLASS: Record<ProjectStatus, string> = {
  active: 'bg-emerald-50 text-emerald-700',
  on_hold: 'bg-amber-50 text-amber-700',
  completed: 'bg-blue-50 text-blue-700',
  archived: 'bg-slate-100 text-slate-500',
};

@Component({
  selector: 'app-all-projects-dialog',
  standalone: true,
  imports: [RouterLink, MatDialogModule, MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="w-[500px] max-w-full flex flex-col max-h-[80vh]">
      <!-- Header -->
      <div class="flex items-center gap-3 px-5 py-4 border-b border-slate-100 flex-shrink-0">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
             style="background: linear-gradient(135deg, #3b82f6, #2563eb); box-shadow: 0 4px 10px rgba(37,99,235,0.3)">
          <mat-icon class="text-white" style="font-size:18px;width:18px;height:18px;line-height:1">folder_open</mat-icon>
        </div>
        <div class="flex-1 min-w-0">
          <h2 class="text-[0.9375rem] font-semibold text-slate-900 leading-tight">All Projects</h2>
          <p class="text-xs text-slate-400 leading-tight">{{ projects.length }} total</p>
        </div>
        <button
          (click)="openNewProject()"
          class="flex items-center gap-1.5 px-3 h-8 rounded-lg bg-blue-600 hover:bg-blue-700
                 text-white text-xs font-medium transition-colors mr-2">
          <mat-icon style="font-size:14px;width:14px;height:14px;line-height:1">add</mat-icon>
          New project
        </button>
        <button
          (click)="dialogRef.close()"
          class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400
                 hover:bg-slate-100 hover:text-slate-700 transition-colors flex-shrink-0">
          <mat-icon style="font-size:18px;width:18px;height:18px;line-height:1">close</mat-icon>
        </button>
      </div>

      <!-- List -->
      <div class="overflow-y-auto flex-1 p-3">
        @if (projects.length === 0) {
          <div class="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
            <mat-icon style="font-size:36px;width:36px;height:36px">folder_open</mat-icon>
            <p class="text-sm">No projects yet</p>
          </div>
        } @else {
          <div class="flex flex-col gap-0.5">
            @for (p of projects; track p.id) {
              <a
                [routerLink]="['/projects', p.id]"
                (click)="dialogRef.close()"
                class="flex items-center gap-3 px-3 py-2.5 rounded-lg
                       hover:bg-slate-50 transition-colors group no-underline">
                <span class="w-3 h-3 rounded-full flex-shrink-0"
                      [style.background]="p.color ?? '#4c68c0'"></span>
                <span class="flex-1 text-sm font-medium text-slate-700
                             group-hover:text-slate-900 truncate">{{ p.name }}</span>
                @if (p.description) {
                  <span class="text-xs text-slate-400 truncate max-w-[140px] hidden sm:block">
                    {{ p.description }}
                  </span>
                }
                <span class="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                      [class]="statusClass(p.status)">{{ statusLabel(p.status) }}</span>
                <mat-icon class="text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0"
                          style="font-size:14px;width:14px;height:14px;line-height:1">
                  chevron_right
                </mat-icon>
              </a>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class AllProjectsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<AllProjectsDialogComponent>);
  readonly projects: Project[] = inject(MAT_DIALOG_DATA);
  private readonly dialog = inject(MatDialog);

  statusLabel(status: ProjectStatus): string {
    return STATUS_LABEL[status] ?? status;
  }

  statusClass(status: ProjectStatus): string {
    return STATUS_CLASS[status] ?? 'bg-slate-100 text-slate-500';
  }

  openNewProject(): void {
    this.dialogRef.close();
    this.dialog.open(ProjectFormDialogComponent, { autoFocus: 'first-tabbable', width: '480px' });
  }
}
