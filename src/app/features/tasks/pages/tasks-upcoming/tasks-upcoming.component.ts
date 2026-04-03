import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-tasks-upcoming',
  standalone: true,
  imports: [PageHeaderComponent, EmptyStateComponent],
  template: `
    <app-page-header title="Upcoming" subtitle="Tasks due in the future" />
    <app-empty-state
      icon="upcoming"
      title="No upcoming tasks"
      message="Upcoming view implemented in Increment 5."
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksUpcomingComponent {}
