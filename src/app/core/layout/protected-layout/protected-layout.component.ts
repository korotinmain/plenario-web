import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { AuthStore } from '../../../features/auth/data-access/auth.store';
import { AuthService } from '../../auth/auth.service';
import { ProjectsStore } from '../../../features/projects/data-access/projects.store';
import { ProjectFormDialogComponent } from '../../../features/projects/components/project-form-dialog/project-form-dialog.component';

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
  private readonly dialog = inject(MatDialog);
  readonly user = toSignal(inject(AuthService).user$);

  private readonly projectsStore = inject(ProjectsStore);
  readonly projects = toSignal(this.projectsStore.state$.pipe(map((s) => s.projects)), {
    initialValue: [],
  });
  readonly projectsExpanded = signal(true);

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'grid_view', route: '/dashboard' },
    { label: 'Projects', icon: 'folder_open', route: '/projects', sectionLabel: 'Workspace' },
    { label: 'Tasks', icon: 'task_alt', route: '/tasks' },
    { label: 'Settings', icon: 'settings', route: '/settings', sectionLabel: 'Account' },
  ];

  logout(): void {
    this.authStore.logout();
  }

  toggleProjects(): void {
    this.projectsExpanded.set(!this.projectsExpanded());
  }

  openNewProject(): void {
    this.dialog.open(ProjectFormDialogComponent, { autoFocus: 'first-tabbable', width: '480px' });
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
