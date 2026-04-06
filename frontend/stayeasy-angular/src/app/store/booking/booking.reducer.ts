import { createReducer, on } from '@ngrx/store';
import { BookingActions } from './booking.actions';
import { initialBookingState } from './booking.state';

export const bookingFeatureKey = 'booking';

export const bookingReducer = createReducer(
  initialBookingState,
  on(BookingActions.createHold, BookingActions.loadMyBookings, BookingActions.confirmBooking, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  on(BookingActions.holdCreated, (state, { hold }) => ({
    ...state,
    currentHold: hold,
    isLoading: false
  })),
  on(BookingActions.loadMyBookingsSuccess, (state, { bookings }) => ({
    ...state,
    myBookings: bookings,
    isLoading: false
  })),
  on(BookingActions.bookingConfirmed, (state) => ({
    ...state,
    isLoading: false
  })),
  on(BookingActions.createHoldFailure, BookingActions.loadMyBookingsFailure, BookingActions.confirmBookingFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  on(BookingActions.setCurrentHold, (state, { hold }) => ({ ...state, currentHold: hold })),
  on(BookingActions.clearError, (state) => ({ ...state, error: null }))
);
