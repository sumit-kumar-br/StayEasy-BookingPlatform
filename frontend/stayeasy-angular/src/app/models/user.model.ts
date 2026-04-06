export enum UserRole {
  Traveler = 0,
  HotelManager = 1,
  Admin = 2
}

export interface User {
  userId: string;
  fullName: string;
  email: string;
  role: UserRole;
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  isBanned: boolean;
  createdAt: string;
}
