import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { interval, Subscription, timeout } from 'rxjs';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
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
    MatButtonModule,
    MatIconModule
    ,MatProgressSpinnerModule
  ],
  template: `
    <section class="checkout-container" *ngIf="hold">
      <div class="checkout-header">
        <h1>Complete Your Booking</h1>
        <p class="subtitle">Secure payment & reservation confirmation</p>
      </div>

      <div class="checkout-content">
        <mat-card class="summary-card">
          <div class="summary-header">
            <h3>Booking Summary</h3>
            <div class="timer" [class.critical]="remainingSeconds < 120">
              <span class="timer-icon">⏱</span>
              <span class="timer-text">{{ countdownLabel }}</span>
              <span class="timer-label">remaining</span>
            </div>
          </div>

          <div class="summary-details">
            <div class="summary-item">
              <span class="label">Hotel</span>
              <span class="value">{{ hold.hotelName }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Room</span>
              <span class="value">{{ hold.roomTypeName }}</span>
            </div>
            <div class="summary-item">
              <span class="label">Check-in · Check-out</span>
              <span class="value">{{ hold.checkIn }} — {{ hold.checkOut }}</span>
            </div>
          </div>

          <div class="summary-total">
            <span class="label">Total Amount</span>
            <span class="total-price">{{ hold.totalAmount | currency: 'INR':'symbol':'1.0-0' }}</span>
          </div>
        </mat-card>

        <form [formGroup]="form" (ngSubmit)="confirm()" class="checkout-form">
          <mat-card class="form-section">
            <h3 class="form-title">Guest Information</h3>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="guestName" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email Address</mat-label>
              <input matInput type="email" formControlName="guestEmail" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Special Requests (Optional)</mat-label>
              <textarea matInput rows="3" formControlName="specialRequests" placeholder="e.g., early check-in, room preference..."></textarea>
            </mat-form-field>
          </mat-card>

          <mat-card class="form-section">
            <h3 class="form-title">Payment Information</h3>
            <p class="payment-notice">Demo mode - Use any 16-digit card number</p>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Cardholder Name</mat-label>
              <input matInput formControlName="cardholderName" />
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Card Number</mat-label>
              <input matInput maxlength="19" formControlName="cardNumber" placeholder="4242 4242 4242 4242" />
            </mat-form-field>

            <div class="card-details-grid">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Expiry Date</mat-label>
                <input matInput maxlength="5" formControlName="expiry" placeholder="MM/YY" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>CVV</mat-label>
                <input matInput maxlength="4" type="password" formControlName="cvv" placeholder="123" />
              </mat-form-field>
            </div>
          </mat-card>

          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || isProcessingPayment" class="submit-btn">
            <span *ngIf="!isProcessingPayment">Pay {{ hold.totalAmount | currency: 'INR':'symbol':'1.0-0' }}</span>
            <span *ngIf="isProcessingPayment" class="processing-label">
              <mat-spinner diameter="18"></mat-spinner>
              <span>Processing...</span>
            </span>
          </button>

          <p class="security-note">
            <span class="lock-icon" aria-hidden="true">🔒</span>
            Your payment information is secure and encrypted
          </p>
        </form>
      </div>
    </section>
  `,
  styles: [
    `
      .checkout-container {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        min-height: 100vh;
        padding: 40px 16px;
      }

      .checkout-header {
        text-align: center;
        margin-bottom: 40px;

        h1 {
          margin: 0 0 8px;
          font-size: 2.2rem;
          font-weight: 700;
          color: #0f2742;
        }
      }

      .subtitle {
        margin: 0;
        color: #64748b;
        font-size: 1.05rem;
      }

      .checkout-content {
        max-width: 800px;
        margin: 0 auto;
      }

      .summary-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 12px;
        padding: 24px;
        margin-bottom: 28px;
        box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);

        .summary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);

          h3 {
            margin: 0;
            font-size: 1.2rem;
            font-weight: 600;
          }
        }

        .timer {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          font-weight: 600;

          &.critical {
            background: rgba(239, 68, 68, 0.2);
            border-color: rgba(239, 68, 68, 0.5);
            animation: pulse 1s infinite;
          }

          .timer-icon {
            font-size: 1.2rem;
          }

          .timer-text {
            font-size: 1.1rem;
          }

          .timer-label {
            font-size: 0.8rem;
            opacity: 0.8;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      }

      .summary-details {
        display: grid;
        gap: 12px;
        margin-bottom: 24px;
      }

      .summary-item {
        .label {
          display: block;
          font-size: 0.85rem;
          opacity: 0.9;
          margin-bottom: 4px;
          font-weight: 500;
        }

        .value {
          display: block;
          font-size: 1rem;
          font-weight: 600;
        }
      }

      .summary-total {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.2);

        .label {
          font-size: 1rem;
          font-weight: 600;
        }

        .total-price {
          font-size: 2rem;
          font-weight: 700;
        }
      }

      .checkout-form {
        display: grid;
        gap: 20px;
      }

      .form-section {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

        .form-title {
          margin: 0 0 20px;
          color: #0f2742;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .payment-notice {
          background: #fef3c7;
          border: 1px solid #fcd34d;
          border-radius: 8px;
          padding: 12px;
          color: #92400e;
          font-size: 0.9rem;
          margin: 0 0 16px;
        }
      }

      .full-width {
        width: 100%;
        margin-bottom: 16px !important;
      }

      .card-details-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 0;
      }

      .submit-btn {
        width: 100%;
        height: 56px;
        font-size: 1.1rem;
        font-weight: 600;
        border-radius: 8px;
        margin-top: 16px;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        transition: all 0.3s ease;

        &:hover:not(:disabled) {
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
          transform: translateY(-2px);
        }

        &:disabled {
          opacity: 0.6;
        }

        .processing-label {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        mat-spinner {
          display: inline-block;
        }
      }

      .security-note {
        text-align: center;
        margin-top: 16px;
        color: #64748b;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;

        .lock-icon {
          font-size: 18px;
          color: #16a34a;
        }

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
          color: #16a34a;
        }
      }

      @media (max-width: 768px) {
        .checkout-container {
          padding: 24px 16px;
        }

        .checkout-header h1 {
          font-size: 1.8rem;
        }

        .summary-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;

          h3 {
            width: 100%;
          }
        }

        .timer {
          align-self: flex-end;
        }

        .form-section {
          padding: 16px;
        }

        .card-details-grid {
          grid-template-columns: 1fr;
        }

        .summary-total {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }
      }
    `
  ]
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private readonly bookingService = inject(BookingService);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  hold: Hold | null = null;
  holdId = '';
  remainingSeconds = 0;
  countdownLabel = '10:00';
  isProcessingPayment = false;

  private timerSub?: Subscription;
  private confirmSub?: Subscription;
  private processingWatchdog?: ReturnType<typeof setTimeout>;

  form = this.fb.group({
    guestName: ['', Validators.required],
    guestEmail: ['', [Validators.required, Validators.email]],
    specialRequests: [''],
    cardholderName: ['', Validators.required],
    cardNumber: ['', Validators.required],
    expiry: ['', Validators.required],
    cvv: ['', Validators.required]
  });

  ngOnInit(): void {
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
    this.confirmSub?.unsubscribe();
    if (this.processingWatchdog) {
      clearTimeout(this.processingWatchdog);
    }
  }

  confirm(): void {
    if (!this.hold || this.isProcessingPayment) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.notification.error('Please fill all required details.');
      return;
    }

    const rawCardNumber = (this.form.value.cardNumber ?? '').replace(/\s+/g, '');
    const expiry = this.form.value.expiry ?? '';
    const cvv = this.form.value.cvv ?? '';

    if (!/^\d{16}$/.test(rawCardNumber)) {
      this.notification.error('Enter a valid 16-digit card number.');
      return;
    }

    if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(expiry)) {
      this.notification.error('Enter expiry in MM/YY format.');
      return;
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      this.notification.error('Enter a valid CVV.');
      return;
    }

    this.isProcessingPayment = true;
    this.processingWatchdog = setTimeout(() => {
      if (!this.isProcessingPayment) {
        return;
      }

      this.isProcessingPayment = false;
      this.notification.error('Booking request timed out. Please click the button again.');
    }, 12000);

    this.confirmSub = this.bookingService
      .confirmBooking({
        holdId: this.hold!.holdId,
        guestName: this.form.value.guestName ?? '',
        guestEmail: this.form.value.guestEmail ?? '',
        specialRequests: this.form.value.specialRequests ?? ''
      })
      .pipe(timeout(20000))
      .subscribe({
        next: (booking) => {
          this.isProcessingPayment = false;
          if (this.processingWatchdog) {
            clearTimeout(this.processingWatchdog);
          }
          this.notification.success('Payment successful. Booking confirmed.');
          this.router.navigate(['/booking-confirmation', booking.id]);
        },
        error: (error: HttpErrorResponse) => {
          this.isProcessingPayment = false;
          if (this.processingWatchdog) {
            clearTimeout(this.processingWatchdog);
          }

          const reason = this.readApiErrorMessage(error);
          this.notification.error(reason);

          if (reason.includes('Hold has expired') || reason.includes('Hold not found or already released')) {
            this.router.navigate(['/hotels/search']);
          }
        }
      });
  }

  private readApiErrorMessage(error: HttpErrorResponse): string {
    const payload = error.error as
      | { message?: string; errors?: string[] | Record<string, string[]> }
      | undefined;

    if (typeof payload?.message === 'string' && payload.message.trim()) {
      return payload.message;
    }

    if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
      return payload.errors[0];
    }

    if (payload?.errors && typeof payload.errors === 'object') {
      const first = Object.values(payload.errors)[0];
      if (Array.isArray(first) && first.length > 0) {
        return first[0];
      }
    }

    if (error.status === 400) {
      return 'Booking request was rejected. Your hold may have expired; please reselect the room.';
    }

    return 'Unable to confirm booking right now. Please try again.';
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
