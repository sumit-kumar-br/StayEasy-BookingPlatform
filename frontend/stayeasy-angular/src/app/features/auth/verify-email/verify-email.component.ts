import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { map, switchMap } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card class="card">
      <h2>Email Verification</h2>
      <p *ngIf="status$ | async as status">{{ status }}</p>
    </mat-card>
  `,
  styles: [
    `
      .card {
        max-width: 520px;
        margin: 32px auto;
        padding: 24px;
      }
    `
  ]
})
export class VerifyEmailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  readonly status$ = this.route.queryParamMap.pipe(
    map((params) => params.get('token')),
    switchMap((token) => {
      if (!token) {
        return ['Invalid verification token.'];
      }

      return this.authService.verifyEmail(token).pipe(map((res) => res.message || 'Email verified.'));
    })
  );
}
