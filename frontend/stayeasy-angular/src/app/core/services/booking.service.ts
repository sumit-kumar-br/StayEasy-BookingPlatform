import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import { Booking, ConfirmBookingRequest, CreateHoldRequest, Hold, RoomAvailability } from '../../models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly http = inject(HttpClient);

  createHold(request: CreateHoldRequest): Observable<Hold> {
    return this.http
      .post<ApiResponse<Hold>>(`${environment.bookingApiUrl}/bookings/hold`, request)
      .pipe(map((res) => res.data));
  }

  getHold(holdId: string): Observable<Hold> {
    return this.http
      .get<ApiResponse<Hold>>(`${environment.bookingApiUrl}/bookings/hold/${holdId}`)
      .pipe(map((res) => res.data));
  }

  releaseHold(holdId: string): Observable<unknown> {
    return this.http
      .delete<ApiResponse<unknown>>(`${environment.bookingApiUrl}/bookings/hold/${holdId}`)
      .pipe(map((res) => res.data));
  }

  confirmBooking(request: ConfirmBookingRequest): Observable<Booking> {
    return this.http
      .post<ApiResponse<Booking>>(`${environment.bookingApiUrl}/bookings/confirm`, request)
      .pipe(
        map((res) => res.data),
        catchError((error) => {
          if (error?.status !== 503) {
            return throwError(() => error);
          }

          // Fallback when gateway can't reach downstream booking service.
          return this.http
            .post<ApiResponse<Booking>>('https://localhost:7120/api/bookings/confirm', request)
            .pipe(
              map((res) => res.data),
              catchError(() =>
                this.http
                  .post<ApiResponse<Booking>>('http://localhost:5267/api/bookings/confirm', request)
                  .pipe(map((res) => res.data))
              )
            );
        })
      );
  }

  cancelBooking(id: string): Observable<unknown> {
    return this.http
      .post<ApiResponse<unknown>>(`${environment.bookingApiUrl}/bookings/${id}/cancel`, {})
      .pipe(map((res) => res.data));
  }

  cancelBookingAsManager(id: string): Observable<unknown> {
    return this.http
      .post<ApiResponse<unknown>>(`${environment.bookingApiUrl}/bookings/${id}/manager-cancel`, {})
      .pipe(map((res) => res.data));
  }

  confirmBookingAsManager(id: string): Observable<unknown> {
    return this.http
      .post<ApiResponse<unknown>>(`${environment.bookingApiUrl}/bookings/${id}/manager-confirm`, {})
      .pipe(map((res) => res.data));
  }

  getMyBookings(): Observable<Booking[]> {
    return this.http
      .get<ApiResponse<Booking[]>>(`${environment.bookingApiUrl}/bookings/my`)
      .pipe(map((res) => res.data ?? []));
  }

  getBookingById(id: string): Observable<Booking> {
    return this.http
      .get<ApiResponse<Booking>>(`${environment.bookingApiUrl}/bookings/${id}`)
      .pipe(map((res) => res.data));
  }

  getIncomingBookings(): Observable<Booking[]> {
    return this.http
      .get<ApiResponse<Booking[]>>(`${environment.bookingApiUrl}/bookings/incoming`)
      .pipe(map((res) => res.data ?? []));
  }

  getRoomAvailability(hotelId: string, checkIn: string, checkOut: string): Observable<RoomAvailability[]> {
    return this.http
      .get<ApiResponse<RoomAvailability[]>>(
        `${environment.bookingApiUrl}/bookings/availability?hotelId=${hotelId}&checkIn=${checkIn}&checkOut=${checkOut}`
      )
      .pipe(map((res) => res.data ?? []));
  }
}
