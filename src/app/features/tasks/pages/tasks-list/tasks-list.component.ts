import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, PageHeaderComponent, EmptyStateComponent],
  template: `
    <app-page-header title="Tasks">
      <button mat-raised-button disabled>
        <mat-icon>add</mat-icon>
        New task
      </button>
    </app-page-header>
    <app-empty-state
      icon="task_alt"
      title="No tasks yet"
      message="Tasks management implemented in Increment 5."
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksListComponent {}
