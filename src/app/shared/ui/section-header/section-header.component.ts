import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-section-header',
  standalone: true,
  template: `
    <div class="section-header">
      <h2 class="section-header__title">{{ title }}</h2>
      <div class="section-header__actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }

      .section-header__title {
        margin: 0;
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--mat-sys-on-surface-variant);
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .section-header__actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionHeaderComponent {
  @Input({ required: true }) title!: string;
}
