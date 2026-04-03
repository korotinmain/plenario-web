import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, PageHeaderComponent, EmptyStateComponent],
  template: `
    <app-page-header title="Projects">
      <button mat-raised-button disabled>
        <mat-icon>add</mat-icon>
        New project
      </button>
    </app-page-header>
    <app-empty-state
      icon="folder_open"
      title="No projects yet"
      message="Projects management implemented in Increment 4."
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsListComponent {}
