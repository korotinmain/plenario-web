import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="card" [class]="'card--' + (gradient ?? 'default')">
      <div class="card-inner">
        <div class="card-info">
          <p class="card-label">{{ label }}</p>
          <p class="card-value">{{ value }}</p>
        </div>
        @if (icon) {
          <div class="card-icon-wrap">
            <mat-icon class="card-icon">{{ icon }}</mat-icon>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex: 1;
        min-width: 150px;
      }

      .card {
        width: 100%;
        border-radius: 16px;
        overflow: hidden;
        transition: transform 0.18s, box-shadow 0.18s;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
        }

        // ── Gradient variants ──────────────────────────────────────────────
        &--violet  { background: var(--pln-grad-violet); }
        &--emerald { background: var(--pln-grad-emerald); }
        &--blue    { background: var(--pln-grad-blue); }
        &--amber   { background: var(--pln-grad-amber); }

        &--default {
          background: var(--pln-card-bg, #fff);
          border: 1px solid var(--pln-card-border, #E4E4E7);
          box-shadow: var(--pln-card-shadow);

          .card-label { color: var(--pln-text-3); }
          .card-value { color: var(--pln-text-1); }
          .card-icon-wrap { background: rgba(99, 102, 241, 0.1); }
          .card-icon { color: #6366F1; }
        }

        // White text on gradient cards
        &--violet,
        &--emerald,
        &--blue,
        &--amber {
          .card-label { color: rgba(255, 255, 255, 0.75); }
          .card-value { color: #fff; }
          .card-icon-wrap { background: rgba(255, 255, 255, 0.15); }
          .card-icon { color: rgba(255, 255, 255, 0.9); }
        }
      }

      .card-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 22px 24px;
      }

      .card-label {
        margin: 0;
        font-size: 0.6875rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      .card-value {
        margin: 6px 0 0;
        font-size: 2.125rem;
        font-weight: 800;
        line-height: 1;
        letter-spacing: -0.04em;
      }

      .card-icon-wrap {
        width: 46px;
        height: 46px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .card-icon {
        font-size: 22px;
        width: 22px;
        height: 22px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatCardComponent {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string | number;
  @Input() icon?: string;
  @Input() gradient?: 'violet' | 'emerald' | 'blue' | 'amber';
}

