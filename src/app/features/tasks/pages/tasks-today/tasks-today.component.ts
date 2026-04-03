import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-tasks-today',
  standalone: true,
  imports: [PageHeaderComponent, EmptyStateComponent],
  template: `
    <app-page-header title="Today" subtitle="Tasks due today" />
    <app-empty-state
      icon="today"
      title="Nothing due today"
      message="Today view implemented in Increment 5."
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksTodayComponent {}
