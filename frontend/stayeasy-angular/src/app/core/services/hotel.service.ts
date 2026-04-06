import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import { CreateHotelRequest, Hotel } from '../../models/hotel.model';
import { CreateRoomTypeRequest, RoomType } from '../../models/room-type.model';

@Injectable({ providedIn: 'root' })
export class HotelService {
  private readonly http = inject(HttpClient);

  getMyHotels(): Observable<Hotel[]> {
    return this.http
      .get<ApiResponse<Hotel[]>>(`${environment.hotelApiUrl}/hotels/my`)
      .pipe(map((res) => res.data ?? []));
  }

  getAllHotels(): Observable<Hotel[]> {
    return this.http
      .get<ApiResponse<Hotel[]>>(`${environment.hotelApiUrl}/hotels`)
      .pipe(map((res) => res.data ?? []));
  }

  getHotelById(id: string): Observable<Hotel> {
    return this.http
      .get<ApiResponse<Hotel>>(`${environment.hotelApiUrl}/hotels/${id}`)
      .pipe(map((res) => res.data));
  }

  createHotel(request: CreateHotelRequest): Observable<Hotel> {
    return this.http
      .post<ApiResponse<Hotel>>(`${environment.hotelApiUrl}/hotels`, request)
      .pipe(map((res) => res.data));
  }

  updateHotel(id: string, request: CreateHotelRequest): Observable<Hotel> {
    return this.http
      .put<ApiResponse<Hotel>>(`${environment.hotelApiUrl}/hotels/${id}`, request)
      .pipe(map((res) => res.data));
  }

  uploadPhoto(hotelId: string, file: File): Observable<unknown> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http
      .post<ApiResponse<unknown>>(`${environment.hotelApiUrl}/hotels/${hotelId}/photo`, formData)
      .pipe(map((res) => res.data));
  }

  approveHotel(id: string): Observable<unknown> {
    return this.http
      .patch<ApiResponse<unknown>>(`${environment.hotelApiUrl}/hotels/${id}/approve`, {})
      .pipe(map((res) => res.data));
  }

  rejectHotel(id: string): Observable<unknown> {
    return this.http
      .patch<ApiResponse<unknown>>(`${environment.hotelApiUrl}/hotels/${id}/reject`, {})
      .pipe(map((res) => res.data));
  }

  getRoomTypes(hotelId: string): Observable<RoomType[]> {
    return this.http
      .get<ApiResponse<RoomType[]>>(`${environment.hotelApiUrl}/rooms?hotelId=${hotelId}`)
      .pipe(map((res) => res.data ?? []));
  }

  createRoomType(hotelId: string, request: CreateRoomTypeRequest): Observable<RoomType> {
    return this.http
      .post<ApiResponse<RoomType>>(`${environment.hotelApiUrl}/rooms?hotelId=${hotelId}`, request)
      .pipe(map((res) => res.data));
  }

  deleteRoomType(hotelId: string, roomTypeId: string): Observable<unknown> {
    return this.http
      .delete<ApiResponse<unknown>>(`${environment.hotelApiUrl}/rooms/${roomTypeId}?hotelId=${hotelId}`)
      .pipe(map((res) => res.data));
  }
}
