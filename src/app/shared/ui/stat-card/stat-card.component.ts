import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <mat-card class="stat-card">
      <mat-card-content class="stat-card__content">
        <div class="stat-card__info">
          <p class="stat-card__label">{{ label }}</p>
          <p class="stat-card__value">{{ value }}</p>
        </div>
        @if (icon) {
          <mat-icon class="stat-card__icon">{{ icon }}</mat-icon>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex: 1;
        min-width: 160px;
      }

      .stat-card {
        width: 100%;
      }

      .stat-card__content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 20px !important;
      }

      .stat-card__label {
        margin: 0;
        font-size: 0.6875rem;
        font-weight: 600;
        color: var(--mat-sys-on-surface-variant);
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .stat-card__value {
        margin: 6px 0 0;
        font-size: 2rem;
        font-weight: 700;
        color: var(--mat-sys-on-surface);
        line-height: 1;
        letter-spacing: -0.02em;
      }

      .stat-card__icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        color: var(--mat-sys-primary);
        opacity: 0.5;
        flex-shrink: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string | number;
  @Input() icon?: string;
}
