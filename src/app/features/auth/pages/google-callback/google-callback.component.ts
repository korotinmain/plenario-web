import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthApiService } from '../../data-access/auth-api.service';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="flex h-screen items-center justify-center bg-white">
      <mat-spinner diameter="44" />
    </div>
  `,
})
export class GoogleCallbackComponent implements OnInit {
  private readonly authApiService = inject(AuthApiService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.authApiService.me().subscribe({
      next: (user) => {
        this.authService.setUser(user);
        this.router.navigate(['/dashboard'], { replaceUrl: true });
      },
      error: () => {
        this.router.navigate(['/login'], { replaceUrl: true });
      },
    });
  }
}
