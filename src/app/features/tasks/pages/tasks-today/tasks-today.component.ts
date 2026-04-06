import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-tasks-today',
  standalone: true,
  imports: [DatePipe, MatIconModule, PageHeaderComponent],
  template: `
    <app-page-header title="Today" [subtitle]="(today | date: 'EEEE, MMMM d') ?? undefined" />
    <div class="coming-soon-card">
      <div class="cs-icon-ring">
        <div class="cs-icon-wrap">
          <mat-icon class="cs-icon">today</mat-icon>
        </div>
      </div>
      <h2 class="cs-title">Today view coming soon</h2>
      <p class="cs-desc">
        See all tasks due today, across every project, in one focused view. Coming in Increment 5.
      </p>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        animation: fadeInUp 0.28s cubic-bezier(0.22, 1, 0.36, 1) both;
      }

      .coming-soon-card {
        align-items: center;
        text-align: center;
        max-width: 480px;
      }
      .cs-icon-ring {
        padding: 6px;
        border-radius: 24px;
        background: rgba(16, 185, 129, 0.06);
        margin-bottom: 24px;
      }
      .cs-icon-wrap {
        width: 64px;
        height: 64px;
        border-radius: 18px;
        background: linear-gradient(
          135deg,
          rgba(16, 185, 129, 0.12) 0%,
          rgba(52, 211, 153, 0.12) 100%
        );
        border: 1px solid rgba(16, 185, 129, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cs-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        color: #059669;
      }
      .cs-title {
        margin: 0 0 10px;
        font-size: 1.25rem;
        font-weight: 800;
        color: #18181b;
        letter-spacing: -0.03em;
      }
      .cs-desc {
        margin: 0;
        font-size: 0.875rem;
        color: #71717a;
        line-height: 1.65;
        max-width: 340px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksTodayComponent {
  readonly today = new Date();
}
