import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
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
import { AllProjectsDialogComponent } from '../../../features/projects/components/all-projects-dialog/all-projects-dialog.component';

interface NavItem {
  label: string;
  icon: string;
  route: string;
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
  readonly SIDEBAR_LIMIT = 8;

  readonly sidebarProjects = computed(() => this.projects().slice(0, this.SIDEBAR_LIMIT));
  readonly hasMoreProjects = computed(() => this.projects().length > this.SIDEBAR_LIMIT);
  readonly extraCount = computed(() => this.projects().length - this.SIDEBAR_LIMIT);

  readonly mainNavItems: NavItem[] = [
    { label: 'Dashboard', icon: 'grid_view', route: '/dashboard' },
    { label: 'Tasks', icon: 'task_alt', route: '/tasks' },
  ];

  readonly accountNavItems: NavItem[] = [
    { label: 'Settings', icon: 'settings', route: '/settings' },
  ];

  logout(): void {
    this.authStore.logout();
  }

  toggleProjects(): void {
    this.projectsExpanded.update((v) => !v);
  }

  openNewProject(): void {
    this.dialog.open(ProjectFormDialogComponent, { autoFocus: 'first-tabbable', width: '480px' });
  }

  openAllProjects(): void {
    this.dialog.open(AllProjectsDialogComponent, {
      data: this.projects(),
      width: '520px',
      autoFocus: false,
    });
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
