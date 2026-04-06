import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { interval, Subscription } from 'rxjs';
import { loadStripe } from '@stripe/stripe-js';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';
import { Hold } from '../../models/booking.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <mat-card class="wrapper" *ngIf="hold">
      <h2>Checkout</h2>
      <p><strong>Hotel:</strong> {{ hold.hotelName }}</p>
      <p><strong>Room:</strong> {{ hold.roomTypeName }}</p>
      <p><strong>Dates:</strong> {{ hold.checkIn }} - {{ hold.checkOut }}</p>
      <p><strong>Total:</strong> {{ hold.totalAmount | currency }}</p>
      <p class="timer">Time remaining: {{ countdownLabel }}</p>

      <form [formGroup]="form" (ngSubmit)="confirm()">
        <mat-form-field appearance="outline">
          <mat-label>Guest Name</mat-label>
          <input matInput formControlName="guestName" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Guest Email</mat-label>
          <input matInput type="email" formControlName="guestEmail" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Special Requests</mat-label>
          <textarea matInput rows="3" formControlName="specialRequests"></textarea>
        </mat-form-field>

        <button mat-flat-button color="primary" [disabled]="form.invalid">Confirm Booking</button>
      </form>
    </mat-card>
  `,
  styles: [
    `
      .wrapper {
        max-width: 760px;
        margin: 24px auto;
        padding: 24px;
      }

      .timer {
        color: #b91c1c;
        font-weight: 700;
      }

      form {
        display: grid;
        gap: 12px;
        margin-top: 16px;
      }
    `
  ]
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private readonly bookingService = inject(BookingService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  hold: Hold | null = null;
  holdId = '';
  remainingSeconds = 0;
  countdownLabel = '10:00';

  private timerSub?: Subscription;

  form = this.fb.group({
    guestName: ['', Validators.required],
    guestEmail: ['', [Validators.required, Validators.email]],
    specialRequests: ['']
  });

  async ngOnInit(): Promise<void> {
    await loadStripe(environment.stripePublishableKey);

    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.form.patchValue({
      guestName: currentUser.fullName ?? '',
      guestEmail: currentUser.email ?? ''
    });

    this.holdId = (history.state?.holdId as string | undefined) ?? '';
    if (!this.holdId) {
      this.router.navigate(['/']);
      return;
    }

    this.bookingService.getHold(this.holdId).subscribe({
      next: (hold) => {
        this.hold = hold;
        this.remainingSeconds = hold.minutesRemaining * 60;
        this.startTimer();
      },
      error: () => this.router.navigate(['/'])
    });
  }

  ngOnDestroy(): void {
    this.timerSub?.unsubscribe();
  }

  confirm(): void {
    if (this.form.invalid || !this.hold) {
      return;
    }

    this.bookingService
      .confirmBooking({
        holdId: this.hold.holdId,
        guestName: this.form.value.guestName ?? '',
        guestEmail: this.form.value.guestEmail ?? '',
        specialRequests: this.form.value.specialRequests ?? ''
      })
      .subscribe((booking) => {
        this.router.navigate(['/booking-confirmation', booking.id]);
      });
  }

  private startTimer(): void {
    this.updateTimerLabel();
    this.timerSub = interval(1000).subscribe(() => {
      this.remainingSeconds -= 1;
      this.updateTimerLabel();

      if (this.remainingSeconds <= 0) {
        this.timerSub?.unsubscribe();
        this.router.navigate(['/hotels/search']);
      }
    });
  }

  private updateTimerLabel(): void {
    const mins = Math.floor(this.remainingSeconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = Math.floor(this.remainingSeconds % 60)
      .toString()
      .padStart(2, '0');
    this.countdownLabel = `${mins}:${secs}`;
  }
}
