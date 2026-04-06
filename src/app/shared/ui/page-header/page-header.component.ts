import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="page-header">
      <div class="page-header__body">
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
    </div>
  `,
  styles: [
    `
      .page-header {
        margin-bottom: 32px;
      }

      .page-header__body {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
      }

      .page-header__title {
        margin: 0;
        font-size: 1.75rem;
        font-weight: 800;
        color: var(--pln-text-1, #18181B);
        line-height: 1.15;
        letter-spacing: -0.04em;
      }

      .page-header__subtitle {
        margin: 6px 0 0;
        font-size: 0.875rem;
        color: var(--pln-text-3, #71717A);
        line-height: 1.55;
      }

      .page-header__actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
        padding-top: 4px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle?: string;
}
