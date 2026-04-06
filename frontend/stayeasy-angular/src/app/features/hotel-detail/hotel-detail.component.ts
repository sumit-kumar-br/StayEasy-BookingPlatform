import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { forkJoin } from 'rxjs';
import { SearchService } from '../../core/services/search.service';
import { HotelService } from '../../core/services/hotel.service';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Hotel } from '../../models/hotel.model';
import { RoomType } from '../../models/room-type.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating.component';

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, LoadingSpinnerComponent, StarRatingComponent],
  template: `
    <app-loading-spinner *ngIf="isLoading" [fullPage]="true"></app-loading-spinner>

    <ng-container *ngIf="hotel && !isLoading">
      <section class="detail-page">
        <header class="hero-wrap">
          <img class="hero" [src]="hotel.photoUrl || fallbackImage" [alt]="hotel.name" />
          <div class="hero-overlay"></div>
          <div class="hero-content">
            <p class="eyebrow">StayEasy Collection</p>
            <h1>{{ hotel.name }}</h1>
            <app-star-rating [rating]="hotel.starRating"></app-star-rating>
            <p class="location">{{ hotel.address }}, {{ hotel.city }}, {{ hotel.country }}</p>
            <div class="meta-row">
              <span>{{ rooms.length }} room types</span>
              <span>{{ guests }} guest{{ guests > 1 ? 's' : '' }}</span>
              <span>{{ stayNights }} night{{ stayNights > 1 ? 's' : '' }}</span>
            </div>
          </div>
        </header>

        <section class="container">
          <mat-card class="about-card" appearance="outlined">
            <h2>About This Stay</h2>
            <p>{{ hotel.description || 'A refined stay with comfort-focused amenities and thoughtful service.' }}</p>
          </mat-card>

          <div class="rooms-heading">
            <h2>Choose Your Room</h2>
            <p>Rates are per night and taxes are calculated at checkout.</p>
          </div>

          <div class="rooms-grid" *ngIf="rooms.length; else noRooms">
            <mat-card class="room-card" *ngFor="let room of rooms" appearance="outlined">
              <div class="room-top">
                <h3>{{ room.name }}</h3>
                <p class="price">{{ room.pricePerNight | currency: 'INR':'symbol':'1.0-0' }} <span>/ night</span></p>
              </div>

              <p class="room-description">{{ room.description }}</p>

              <div class="room-facts">
                <span>Up to {{ room.maxOccupancy }} guests</span>
                <span>{{ room.bedConfiguration }}</span>
                <span>{{ room.totalRooms }} rooms left</span>
              </div>

              <button mat-flat-button color="primary" (click)="bookRoom(room)">Book this room</button>
            </mat-card>
          </div>

          <ng-template #noRooms>
            <mat-card class="empty-state" appearance="outlined">
              <h3>No room inventory available right now</h3>
              <p>Please try another hotel or come back in a little while.</p>
            </mat-card>
          </ng-template>
        </section>
      </section>
    </ng-container>

    <ng-container *ngIf="!hotel && !isLoading">
      <section class="container">
        <mat-card class="empty-state" appearance="outlined">
          <h3>Unable to load this hotel</h3>
          <p>Please go back and try again.</p>
        </mat-card>
      </section>
    </ng-container>
  `,
  styles: [
    `
      .detail-page {
        min-height: 100vh;
        background: linear-gradient(180deg, #f8fbff 0%, #eef4fb 100%);
      }

      .hero-wrap {
        position: relative;
        min-height: 430px;
        display: grid;
        align-items: end;
      }

      .hero {
        width: 100%;
        height: 430px;
        object-fit: cover;
      }

      .hero-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(100deg, rgba(4, 24, 46, 0.88) 20%, rgba(4, 24, 46, 0.4) 70%);
      }

      .hero-content {
        position: absolute;
        left: 50%;
        bottom: 36px;
        width: min(1120px, calc(100% - 32px));
        transform: translateX(-50%);
        color: #f6fbff;
      }

      .eyebrow {
        margin: 0 0 10px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.78rem;
        color: #b8d9f6;
      }

      h1 {
        margin: 0 0 10px;
        font-size: clamp(1.9rem, 3vw, 3rem);
        line-height: 1.1;
      }

      .location {
        margin: 8px 0 0;
        color: #dbe9f7;
      }

      .meta-row {
        margin-top: 14px;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .meta-row span {
        background: rgba(255, 255, 255, 0.15);
        border: 1px solid rgba(255, 255, 255, 0.25);
        border-radius: 999px;
        padding: 6px 12px;
        font-size: 0.85rem;
      }

      .container {
        max-width: 1120px;
        margin: 28px auto 48px;
        padding: 0 16px;
      }

      .about-card {
        border-radius: 18px;
        border-color: #cfe0f2;
        padding: 4px;
        margin-bottom: 24px;
        background: #ffffffcc;
        backdrop-filter: blur(4px);
      }

      .about-card h2 {
        margin: 6px 0 8px;
        color: #0f355a;
      }

      .about-card p {
        margin: 0;
        color: #27425f;
        line-height: 1.65;
      }

      .rooms-heading {
        display: flex;
        justify-content: space-between;
        align-items: end;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 14px;
      }

      .rooms-heading h2 {
        margin: 0;
        color: #0f355a;
      }

      .rooms-heading p {
        margin: 0;
        color: #5e7289;
      }

      .rooms-grid {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      }

      .room-card {
        border-radius: 16px;
        border-color: #cfe0f2;
        background: #fff;
      }

      .room-top {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 8px;
      }

      h3 {
        margin: 0;
        color: #153e63;
      }

      .room-description {
        margin: 10px 0 12px;
        color: #4d6278;
        line-height: 1.5;
        min-height: 48px;
      }

      .room-facts {
        display: grid;
        gap: 8px;
        margin-bottom: 14px;
      }

      .room-facts span {
        color: #27425f;
        background: #eff5fb;
        border-radius: 10px;
        padding: 6px 10px;
        font-size: 0.9rem;
      }

      .price {
        margin: 0;
        font-weight: 700;
        color: #0f4c81;
        white-space: nowrap;
      }

      .price span {
        font-weight: 500;
        color: #5e7289;
        font-size: 0.9rem;
      }

      button[mat-flat-button] {
        width: 100%;
        border-radius: 10px;
      }

      .empty-state {
        margin-top: 12px;
        border-radius: 16px;
        border-color: #d8e5f2;
      }

      .empty-state h3 {
        margin: 0 0 8px;
      }

      .empty-state p {
        margin: 0;
        color: #5e7289;
      }

      @media (max-width: 768px) {
        .hero-wrap,
        .hero {
          min-height: 360px;
          height: 360px;
        }

        .hero-content {
          bottom: 22px;
        }

        .room-description {
          min-height: 0;
        }
      }
    `
  ]
})
export class HotelDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly searchService = inject(SearchService);
  private readonly hotelService = inject(HotelService);
  private readonly bookingService = inject(BookingService);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);

  hotel: Hotel | null = null;
  rooms: RoomType[] = [];
  isLoading = true;
  stayNights = 1;
  fallbackImage = 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=1600&auto=format&fit=crop';

  private checkIn = '';
  private checkOut = '';
  guests = 1;

  ngOnInit(): void {
    const hotelId = this.route.snapshot.paramMap.get('id');
    this.checkIn = this.route.snapshot.queryParamMap.get('checkIn') ?? '';
    this.checkOut = this.route.snapshot.queryParamMap.get('checkOut') ?? '';
    this.guests = Number(this.route.snapshot.queryParamMap.get('guests') ?? 1);
    this.normalizeStayWindow();
    this.stayNights = this.calculateNights(this.checkIn, this.checkOut);

    if (!hotelId) {
      this.router.navigate(['/']);
      return;
    }

    forkJoin({
      hotel: this.searchService.getHotelDetail(hotelId),
      rooms: this.hotelService.getRoomTypes(hotelId)
    }).subscribe({
      next: ({ hotel, rooms }) => {
        this.hotel = hotel;
        this.rooms = rooms;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  bookRoom(room: RoomType): void {
    if (!this.hotel) {
      return;
    }

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.normalizeStayWindow();

    const nights = this.calculateNights(this.checkIn, this.checkOut);

    this.bookingService
      .createHold({
        hotelId: this.hotel.id,
        roomTypeId: room.id,
        hotelName: this.hotel.name,
        roomTypeName: room.name,
        checkIn: this.checkIn,
        checkOut: this.checkOut,
        guests: this.guests,
        totalAmount: room.pricePerNight * nights
      })
      .subscribe({
        next: (hold) => {
          this.router.navigate(['/checkout'], { state: { holdId: hold.holdId } });
        },
        error: () => {
          this.notification.info('Please verify your stay dates and try again.');
        }
      });
  }

  private normalizeStayWindow(): void {
    const today = new Date();
    const nextDay = new Date(today);
    nextDay.setDate(today.getDate() + 1);

    const checkInDate = new Date(this.checkIn);
    const checkOutDate = new Date(this.checkOut);
    const isCheckInValid = !Number.isNaN(checkInDate.getTime());
    const isCheckOutValid = !Number.isNaN(checkOutDate.getTime());

    if (!isCheckInValid || !this.checkIn) {
      this.checkIn = this.toDateOnly(today);
    }

    if (!isCheckOutValid || !this.checkOut) {
      this.checkOut = this.toDateOnly(nextDay);
    }

    const normalizedIn = new Date(this.checkIn);
    const normalizedOut = new Date(this.checkOut);

    if (normalizedOut <= normalizedIn) {
      normalizedOut.setDate(normalizedIn.getDate() + 1);
      this.checkOut = this.toDateOnly(normalizedOut);
    }
  }

  private toDateOnly(date: Date): string {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
    return local.toISOString().slice(0, 10);
  }

  private calculateNights(checkIn: string, checkOut: string): number {
    const inDate = new Date(checkIn).getTime();
    const outDate = new Date(checkOut).getTime();

    if (Number.isNaN(inDate) || Number.isNaN(outDate) || outDate <= inDate) {
      return 1;
    }

    return Math.ceil((outDate - inDate) / 86_400_000);
  }
}
