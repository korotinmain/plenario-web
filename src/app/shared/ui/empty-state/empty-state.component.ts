import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="empty-state">
      <div class="empty-state__icon-ring">
        <div class="empty-state__icon-wrap">
          <mat-icon class="empty-state__icon">{{ icon }}</mat-icon>
        </div>
      </div>
      <h3 class="empty-state__title">{{ title }}</h3>
      @if (message) {
        <p class="empty-state__message">{{ message }}</p>
      }
      <div class="empty-state__actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 72px 24px;
        text-align: center;
      }

      .empty-state__icon-ring {
        padding: 6px;
        border-radius: 24px;
        background: rgba(99, 102, 241, 0.06);
        margin-bottom: 22px;
      }

      .empty-state__icon-wrap {
        width: 64px;
        height: 64px;
        border-radius: 18px;
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%);
        border: 1px solid rgba(99, 102, 241, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .empty-state__icon {
        font-size: 30px;
        width: 30px;
        height: 30px;
        color: #6366F1;
        opacity: 0.8;
      }

      .empty-state__title {
        margin: 0 0 8px;
        font-size: 1.125rem;
        font-weight: 700;
        color: var(--pln-text-1, #18181B);
        letter-spacing: -0.02em;
      }

      .empty-state__message {
        margin: 0;
        font-size: 0.875rem;
        color: var(--pln-text-3, #71717A);
        max-width: 300px;
        line-height: 1.6;
      }

      .empty-state__actions {
        margin-top: 24px;
        display: flex;
        gap: 8px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input({ required: true }) title!: string;
  @Input() message = '';
}

