import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { BookingService } from '../../core/services/booking.service';
import { NotificationService } from '../../core/services/notification.service';
import { BookingActions } from './booking.actions';

@Injectable()
export class BookingEffects {
  private readonly actions$ = inject(Actions);
  private readonly bookingService = inject(BookingService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  createHold$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.createHold),
      switchMap(({ request }) =>
        this.bookingService.createHold(request).pipe(
          map((hold) => BookingActions.holdCreated({ hold })),
          catchError((error) => of(BookingActions.createHoldFailure({ error: this.readError(error) })))
        )
      )
    )
  );

  loadMyBookings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.loadMyBookings),
      switchMap(() =>
        this.bookingService.getMyBookings().pipe(
          map((bookings) => BookingActions.loadMyBookingsSuccess({ bookings })),
          catchError((error) => of(BookingActions.loadMyBookingsFailure({ error: this.readError(error) })))
        )
      )
    )
  );

  confirmBooking$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BookingActions.confirmBooking),
      switchMap(({ request }) =>
        this.bookingService.confirmBooking(request).pipe(
          map((booking) => BookingActions.bookingConfirmed({ booking })),
          catchError((error) => of(BookingActions.confirmBookingFailure({ error: this.readError(error) })))
        )
      )
    )
  );

  bookingConfirmed$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(BookingActions.bookingConfirmed),
        tap(({ booking }) => {
          this.notification.success('Booking confirmed successfully.');
          this.router.navigate(['/booking-confirmation', booking.id]);
        })
      ),
    { dispatch: false }
  );

  bookingFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(BookingActions.createHoldFailure, BookingActions.confirmBookingFailure, BookingActions.loadMyBookingsFailure),
        tap(({ error }) => this.notification.error(error))
      ),
    { dispatch: false }
  );

  private readError(error: unknown): string {
    const err = error as { error?: { message?: string } };
    return err?.error?.message ?? 'Request failed.';
  }
}
