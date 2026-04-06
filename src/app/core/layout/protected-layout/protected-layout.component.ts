import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthStore } from '../../../features/auth/data-access/auth.store';
import { AuthService } from '../../auth/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  sectionLabel?: string;
}

@Component({
  selector: 'app-protected-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatRippleModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './protected-layout.component.html',
  styleUrl: './protected-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProtectedLayoutComponent {
  private readonly authStore = inject(AuthStore);
  readonly user = toSignal(inject(AuthService).user$);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'grid_view', route: '/dashboard' },
    { label: 'Projects', icon: 'folder_open', route: '/projects', sectionLabel: 'Workspace' },
    { label: 'Tasks', icon: 'task_alt', route: '/tasks' },
    { label: 'Settings', icon: 'settings', route: '/settings', sectionLabel: 'Account' },
  ];

  logout(): void {
    this.authStore.logout();
  }

  get userInitials(): string {
    const u = this.user();
    if (!u) return '?';
    if (u.name) {
      return u.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return u.email[0].toUpperCase();
  }
}
