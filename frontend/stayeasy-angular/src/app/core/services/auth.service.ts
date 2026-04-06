import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../../models/api-response.model';
import { AdminUser, LoginRequest, RegisterRequest, User, UserRole } from '../../models/user.model';

interface AuthApiUser {
  userId: string;
  fullName: string;
  email: string;
  role: string | number;
  accessToken: string;
  refreshToken?: string;
  referenceToken?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private accessToken: string | null = null;
  private refreshTokenValue: string | null = null;
  private refreshTimeout: ReturnType<typeof setTimeout> | null = null;

  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<ApiResponse<AuthApiUser>>(`${environment.authApiUrl}/auth/login`, credentials).pipe(
      map((res) => {
        if (!res.success || !res.data) {
          const message = res.errors?.[0] || res.message || 'Login failed.';
          throw new Error(message);
        }

        return this.mapApiUser(res.data);
      }),
      tap((user) => this.setSession(user))
    );
  }

  register(request: RegisterRequest): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(`${environment.authApiUrl}/auth/register`, request);
  }

  refreshToken(): Observable<User | null> {
    if (!this.refreshTokenValue) {
      return of(null);
    }

    return this.http
      .post<ApiResponse<AuthApiUser>>(`${environment.authApiUrl}/auth/refresh-token`, {
        refreshToken: this.refreshTokenValue
      })
      .pipe(
        map((res) => (res.data ? this.mapApiUser(res.data) : null)),
        tap((user) => {
          if (user) {
            this.setSession(user);
          }
        }),
        catchError(() => {
          this.clearSession();
          return of(null);
        })
      );
  }

  verifyEmail(token: string): Observable<ApiResponse<unknown>> {
    return this.http.get<ApiResponse<unknown>>(`${environment.authApiUrl}/auth/verify-email`, {
      params: { token }
    });
  }

  getUsers(): Observable<AdminUser[]> {
    return this.http
      .get<ApiResponse<AdminUser[]>>(`${environment.authApiUrl}/auth/users`)
      .pipe(map((res) => res.data ?? []));
  }

  banUser(userId: string): Observable<ApiResponse<boolean>> {
    return this.http.patch<ApiResponse<boolean>>(
      `${environment.authApiUrl}/auth/users/${userId}/ban`,
      {}
    );
  }

  unbanUser(userId: string): Observable<ApiResponse<boolean>> {
    return this.http.patch<ApiResponse<boolean>>(
      `${environment.authApiUrl}/auth/users/${userId}/unban`,
      {}
    );
  }

  verifyUser(userId: string): Observable<ApiResponse<boolean>> {
    return this.http.patch<ApiResponse<boolean>>(
      `${environment.authApiUrl}/auth/users/${userId}/verify`,
      {}
    );
  }

  logout(): Observable<unknown> {
    const refreshToken = this.refreshTokenValue;
    this.clearSession();

    if (!refreshToken) {
      return of(null);
    }

    return this.http
      .post<ApiResponse<unknown>>(`${environment.authApiUrl}/auth/logout`, {
        refreshToken
      })
      .pipe(catchError(() => of(null)));
  }

  forceLogout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  setSession(user: User): void {
    this.accessToken = user.accessToken;
    this.refreshTokenValue = user.refreshToken;
    this.currentUserSubject.next(user);
    this.scheduleRefresh(user.accessToken);
  }

  clearSession(): void {
    this.accessToken = null;
    this.refreshTokenValue = null;
    this.currentUserSubject.next(null);

    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }
  }

  isLoggedIn(): boolean {
    return !!this.accessToken;
  }

  getRole(): UserRole | null {
    return this.currentUserSubject.value?.role ?? null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshTokenValue;
  }

  private scheduleRefresh(jwt: string): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    const expirationMs = this.getJwtExpiration(jwt);
    if (!expirationMs) {
      return;
    }

    const now = Date.now();
    const triggerIn = Math.max(expirationMs - now - 60_000, 5_000);

    this.refreshTimeout = setTimeout(() => {
      this.refreshToken().subscribe({
        error: () => this.forceLogout()
      });
    }, triggerIn);
  }

  private getJwtExpiration(token: string): number | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1])) as { exp?: number };
      return payload.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  private mapApiUser(user: AuthApiUser): User {
    return {
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      role: this.toUserRole(user.role),
      accessToken: user.accessToken,
      refreshToken: user.refreshToken ?? user.referenceToken ?? ''
    };
  }

  private toUserRole(role: string | number): UserRole {
    if (typeof role === 'number') {
      return role as UserRole;
    }

    const normalized = role.toLowerCase();
    if (normalized === 'traveller' || normalized === 'traveler') {
      return UserRole.Traveler;
    }

    if (normalized === 'hotelmanager') {
      return UserRole.HotelManager;
    }

    return UserRole.Admin;
  }
}
