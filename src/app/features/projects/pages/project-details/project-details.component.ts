import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, PageHeaderComponent],
  template: `
    <app-page-header title="Project details">
      <a mat-button routerLink="/projects">
        <mat-icon>arrow_back</mat-icon>
        Back to projects
      </a>
    </app-page-header>
    <p class="text-muted">Project details implemented in Increment 4.</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailsComponent {}
