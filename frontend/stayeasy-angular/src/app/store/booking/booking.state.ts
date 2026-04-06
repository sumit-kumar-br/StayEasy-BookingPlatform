import { Booking, Hold } from '../../models/booking.model';

export interface BookingState {
  currentHold: Hold | null;
  myBookings: Booking[];
  isLoading: boolean;
  error: string | null;
}

export const initialBookingState: BookingState = {
  currentHold: null,
  myBookings: [],
  isLoading: false,
  error: null
};
