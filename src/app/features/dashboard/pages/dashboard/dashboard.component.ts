import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header title="Dashboard" subtitle="Your planning overview" />
    <p class="text-muted">Dashboard content implemented in Increment 6.</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {}
