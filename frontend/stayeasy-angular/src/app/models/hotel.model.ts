import { RoomType } from './room-type.model';

export enum HotelStatus {
  PendingReview = 'PendingReview',
  Approved = 'Approved',
  Suspended = 'Suspended'
}

export interface Hotel {
  id: string;
  managerId: string;
  name: string;
  description: string;
  city: string;
  address: string;
  country: string;
  starRating: number;
  status: HotelStatus | string;
  lowestPricePerNight?: number;
  photoUrl?: string;
  roomTypes?: RoomType[];
  latitude?: number;
  longitude?: number;
}

export interface CreateHotelRequest {
  name: string;
  description: string;
  city: string;
  address: string;
  country: string;
  starRating: number;
  latitude: number;
  longitude: number;
}

export interface HotelSearchParams {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minStars?: number;
  maxStars?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'stars_desc';
}
