import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-tasks-upcoming',
  standalone: true,
  imports: [MatIconModule, PageHeaderComponent],
  template: `
    <app-page-header title="Upcoming" subtitle="Tasks due in the next 7 days and beyond" />
    <div class="coming-soon-card">
      <div class="cs-icon-ring">
        <div class="cs-icon-wrap">
          <mat-icon class="cs-icon">event</mat-icon>
        </div>
      </div>
      <h2 class="cs-title">Upcoming view coming soon</h2>
      <p class="cs-desc">Browse tasks sorted by due date, filter by project or priority, and stay ahead of your schedule. Coming in Increment 5.</p>
    </div>
  `,
  styles: [`
    .coming-soon-card {
      background: #fff;
      border: 1px solid var(--pln-card-border, #E4E4E7);
      border-radius: 20px;
      padding: 56px 40px;
      display: flex; flex-direction: column; align-items: center; text-align: center;
      max-width: 480px;
    }
    .cs-icon-ring { padding: 6px; border-radius: 24px; background: rgba(59,130,246,0.06); margin-bottom: 24px; }
    .cs-icon-wrap {
      width: 64px; height: 64px; border-radius: 18px;
      background: linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(96,165,250,0.12) 100%);
      border: 1px solid rgba(59,130,246,0.15);
      display: flex; align-items: center; justify-content: center;
    }
    .cs-icon { font-size: 28px; width: 28px; height: 28px; color: #3B82F6; }
    .cs-title { margin: 0 0 10px; font-size: 1.25rem; font-weight: 800; color: #18181B; letter-spacing: -0.03em; }
    .cs-desc { margin: 0; font-size: 0.875rem; color: #71717A; line-height: 1.65; max-width: 340px; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksUpcomingComponent {}
