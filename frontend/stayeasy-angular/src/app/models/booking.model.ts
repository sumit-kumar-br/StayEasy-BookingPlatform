export enum BookingStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Cancelled = 'Cancelled',
  CheckedIn = 'CheckedIn'
}

export interface Hold {
  holdId: string;
  hotelId: string;
  roomTypeId: string;
  hotelName: string;
  roomTypeName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  expiresAt: string;
  minutesRemaining: number;
}

export interface Booking {
  id: string;
  bookingRef: string;
  hotelId: string;
  roomTypeId: string;
  hotelName: string;
  roomTypeName: string;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
  status: BookingStatus | string;
  specialRequests?: string;
  createdAt: string;
}

export interface CreateHoldRequest {
  hotelId: string;
  roomTypeId: string;
  hotelName: string;
  roomTypeName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalAmount: number;
}

export interface ConfirmBookingRequest {
  holdId: string;
  guestName: string;
  guestEmail: string;
  specialRequests?: string;
}

export interface RoomAvailability {
  roomTypeId: string;
  totalUnits: number;
  reservedUnits: number;
  availableUnits: number;
}
