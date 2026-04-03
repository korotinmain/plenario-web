import { Component, ChangeDetectionStrategy } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [PageHeaderComponent],
  template: `
    <app-page-header title="Settings" subtitle="Manage your profile and account" />
    <p class="text-muted">Settings pages implemented in Increment 6.</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {}
