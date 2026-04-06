import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Booking, ConfirmBookingRequest, CreateHoldRequest, Hold } from '../../models/booking.model';

export const BookingActions = createActionGroup({
  source: 'Booking',
  events: {
    'Create Hold': props<{ request: CreateHoldRequest }>(),
    'Hold Created': props<{ hold: Hold }>(),
    'Create Hold Failure': props<{ error: string }>(),
    'Load My Bookings': emptyProps(),
    'Load My Bookings Success': props<{ bookings: Booking[] }>(),
    'Load My Bookings Failure': props<{ error: string }>(),
    'Confirm Booking': props<{ request: ConfirmBookingRequest }>(),
    'Booking Confirmed': props<{ booking: Booking }>(),
    'Confirm Booking Failure': props<{ error: string }>(),
    'Set Current Hold': props<{ hold: Hold | null }>(),
    'Clear Error': emptyProps()
  }
});
