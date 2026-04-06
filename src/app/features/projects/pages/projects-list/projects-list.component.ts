import { Component, ChangeDetectionStrategy, inject, OnInit, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { ProjectsStore } from '../../data-access/projects.store';
import { ProjectFormDialogComponent } from '../../components/project-form-dialog/project-form-dialog.component';
import { EditProjectDialogComponent } from '../../components/edit-project-dialog/edit-project-dialog.component';
import { DeleteProjectDialogComponent } from '../../components/delete-project-dialog/delete-project-dialog.component';
import { Project } from '../../models/project.models';

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  on_hold: 'On hold',
  completed: 'Completed',
  archived: 'Archived',
};

const STATUS_CLASSES: Record<string, string> = {
  active: 'status--active',
  on_hold: 'status--hold',
  completed: 'status--done',
  archived: 'status--archived',
};

type FilterKey = 'all' | 'active' | 'on_hold' | 'completed' | 'archived';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    PageHeaderComponent,
    EmptyStateComponent,
  ],
  templateUrl: './projects-list.component.html',
  styleUrl: './projects-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsListComponent implements OnInit {
  readonly store = inject(ProjectsStore);
  private readonly dialog = inject(MatDialog);

  readonly allProjects = toSignal(this.store.state$.pipe(map((s) => s.projects)), { initialValue: [] });
  readonly loading = toSignal(this.store.state$.pipe(map((s) => s.loading)), { initialValue: false });
  readonly error = toSignal(this.store.state$.pipe(map((s) => s.error)), { initialValue: null });

  readonly activeFilter = signal<FilterKey>('all');

  readonly filteredProjects = computed(() => {
    const f = this.activeFilter();
    const all = this.allProjects();
    return f === 'all' ? all : all.filter((p) => p.status === f);
  });

  readonly filters: { key: FilterKey; label: string }[] = [
    { key: 'all',       label: 'All' },
    { key: 'active',    label: 'Active' },
    { key: 'on_hold',   label: 'On hold' },
    { key: 'completed', label: 'Completed' },
    { key: 'archived',  label: 'Archived' },
  ];

  countFor(key: FilterKey): number {
    const all = this.allProjects();
    return key === 'all' ? all.length : all.filter((p) => p.status === key).length;
  }

  readonly statusLabel = (status: string) => STATUS_LABELS[status] ?? status;
  readonly statusClass = (status: string) => STATUS_CLASSES[status] ?? '';

  ngOnInit(): void {
    this.store.load();
  }

  openCreate(): void {
    this.dialog.open(ProjectFormDialogComponent, { autoFocus: 'first-tabbable' });
  }

  openEdit(project: Project): void {
    this.dialog.open(EditProjectDialogComponent, { data: project, autoFocus: 'first-tabbable' });
  }

  openDelete(project: Project): void {
    this.dialog.open(DeleteProjectDialogComponent, { data: project });
  }
}

