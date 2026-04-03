import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="empty-state">
      <mat-icon class="empty-state__icon">{{ icon }}</mat-icon>
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
        padding: 48px 24px;
        text-align: center;
        gap: 8px;
      }

      .empty-state__icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: var(--mat-sys-on-surface-variant);
        opacity: 0.4;
        margin-bottom: 8px;
      }

      .empty-state__title {
        margin: 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--mat-sys-on-surface);
      }

      .empty-state__message {
        margin: 0;
        font-size: 0.875rem;
        color: var(--mat-sys-on-surface-variant);
        max-width: 320px;
        line-height: 1.5;
      }

      .empty-state__actions {
        margin-top: 8px;
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
