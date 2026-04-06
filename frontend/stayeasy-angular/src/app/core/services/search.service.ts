import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import { Hotel, HotelSearchParams } from '../../models/hotel.model';

@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly http = inject(HttpClient);

  searchHotels(params: HotelSearchParams): Observable<Hotel[]> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });

    return this.http
      .get<ApiResponse<Hotel[]>>(`${environment.searchApiUrl}/search/hotels`, { params: httpParams })
      .pipe(map((res) => res.data ?? []));
  }

  getHotelDetail(id: string): Observable<Hotel> {
    return this.http
      .get<ApiResponse<Hotel>>(`${environment.searchApiUrl}/search/hotels/${id}`)
      .pipe(map((res) => res.data));
  }
}
