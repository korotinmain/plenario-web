import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="page-header">
      <div class="page-header__text">
        <h1 class="page-header__title">{{ title }}</h1>
        @if (subtitle) {
          <p class="page-header__subtitle">{{ subtitle }}</p>
        }
      </div>
      <div class="page-header__actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .page-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 24px;
      }

      .page-header__title {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--mat-sys-on-surface);
        line-height: 1.2;
        letter-spacing: -0.02em;
      }

      .page-header__subtitle {
        margin: 4px 0 0;
        font-size: 0.875rem;
        color: var(--mat-sys-on-surface-variant);
      }

      .page-header__actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
}
