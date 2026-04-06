import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, PageHeaderComponent],
  template: `
    <app-page-header title="Tasks" subtitle="Plan, track, and complete your work">
      <button mat-flat-button disabled>
        <mat-icon>add</mat-icon>
        New task
      </button>
    </app-page-header>

    <div class="coming-soon-card">
      <div class="cs-icon-ring">
        <div class="cs-icon-wrap">
          <mat-icon class="cs-icon">task_alt</mat-icon>
        </div>
      </div>
      <h2 class="cs-title">Tasks are coming soon</h2>
      <p class="cs-desc">Full task management — create, assign, prioritise and track tasks across all your projects — is being built in Increment 5.</p>
      <div class="cs-features">
        <span class="cs-chip"><mat-icon>check</mat-icon>Create &amp; edit tasks</span>
        <span class="cs-chip"><mat-icon>check</mat-icon>Priority levels</span>
        <span class="cs-chip"><mat-icon>check</mat-icon>Due dates</span>
        <span class="cs-chip"><mat-icon>check</mat-icon>Project linking</span>
      </div>
    </div>
  `,
  styles: [`
    .coming-soon-card {
      background: #fff;
      border: 1px solid var(--pln-card-border, #E4E4E7);
      border-radius: 20px;
      padding: 56px 40px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      max-width: 560px;
    }
    .cs-icon-ring {
      padding: 6px;
      border-radius: 24px;
      background: rgba(99,102,241,0.06);
      margin-bottom: 24px;
    }
    .cs-icon-wrap {
      width: 64px; height: 64px; border-radius: 18px;
      background: linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.12) 100%);
      border: 1px solid rgba(99,102,241,0.15);
      display: flex; align-items: center; justify-content: center;
    }
    .cs-icon { font-size: 28px; width: 28px; height: 28px; color: #6366F1; }
    .cs-title { margin: 0 0 10px; font-size: 1.25rem; font-weight: 800; color: #18181B; letter-spacing: -0.03em; }
    .cs-desc { margin: 0 0 28px; font-size: 0.875rem; color: #71717A; line-height: 1.65; max-width: 380px; }
    .cs-features { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
    .cs-chip {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 5px 12px; border-radius: 20px;
      background: #F4F4F5; border: 1px solid #E4E4E7;
      font-size: 0.8125rem; font-weight: 500; color: #3F3F46;
      mat-icon { font-size: 14px; width: 14px; height: 14px; color: #059669; }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksListComponent {}
