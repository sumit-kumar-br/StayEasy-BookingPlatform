import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BookingState } from './booking.state';
import { bookingFeatureKey } from './booking.reducer';

export const selectBookingState = createFeatureSelector<BookingState>(bookingFeatureKey);

export const selectCurrentHold = createSelector(selectBookingState, (state) => state.currentHold);
export const selectMyBookings = createSelector(selectBookingState, (state) => state.myBookings);
export const selectBookingLoading = createSelector(selectBookingState, (state) => state.isLoading);
export const selectBookingError = createSelector(selectBookingState, (state) => state.error);
