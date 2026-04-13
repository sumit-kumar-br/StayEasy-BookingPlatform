import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
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
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    LoadingSpinnerComponent,
    StarRatingComponent
  ],
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
                <span>{{ selectedRooms }} room{{ selectedRooms > 1 ? 's' : '' }}</span>
              <span>{{ stayNights }} night{{ stayNights > 1 ? 's' : '' }}</span>
            </div>
          </div>
        </header>

        <section class="container">
          <mat-card class="about-card" appearance="outlined">
            <h2>About This Stay</h2>
            <p>{{ hotel.description || 'A refined stay with comfort-focused amenities and thoughtful service.' }}</p>
          </mat-card>

          <mat-card class="booking-card" appearance="outlined">
            <div class="booking-card-header">
              <div>
                <p class="eyebrow">Plan your booking</p>
                <h2>Choose your dates before selecting a room</h2>
                <p class="booking-note">Flexible plans, instant room hold, and secure checkout.</p>
              </div>
              <div class="booking-summary">
                <span>{{ stayNights }} night{{ stayNights > 1 ? 's' : '' }}</span>
                <span>{{ selectedRooms }} room{{ selectedRooms > 1 ? 's' : '' }}</span>
              </div>
            </div>

            <form class="booking-form" [formGroup]="bookingForm">
              <mat-form-field appearance="outline">
                <mat-label>Check-in</mat-label>
                <input matInput [matDatepicker]="checkInPicker" [min]="minCheckInDate" formControlName="checkIn" />
                <mat-datepicker-toggle matIconSuffix [for]="checkInPicker"></mat-datepicker-toggle>
                <mat-datepicker #checkInPicker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Check-out</mat-label>
                <input matInput [matDatepicker]="checkOutPicker" [min]="minCheckOutDate" formControlName="checkOut" />
                <mat-datepicker-toggle matIconSuffix [for]="checkOutPicker"></mat-datepicker-toggle>
                <mat-datepicker #checkOutPicker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>No. of rooms</mat-label>
                <input matInput type="number" min="1" formControlName="guests" />
              </mat-form-field>
            </form>

            <div class="booking-recap">
              <div class="recap-item">
                <p>Check-in</p>
                <strong>{{ selectedCheckIn | date: 'EEE, MMM d' }}</strong>
              </div>
              <div class="recap-item">
                <p>Check-out</p>
                <strong>{{ selectedCheckOut | date: 'EEE, MMM d' }}</strong>
              </div>
              <div class="recap-item">
                <p>Stay</p>
                <strong>{{ stayNights }} night{{ stayNights > 1 ? 's' : '' }}</strong>
              </div>
              <div class="recap-item">
                <p>Rooms</p>
                <strong>{{ selectedRooms }}</strong>
              </div>
            </div>
          </mat-card>

          <div class="rooms-heading">
            <h2>Choose Your Room</h2>
            <p>
              Rates are per night and taxes are calculated at checkout.
              <span class="selected-window">{{ selectedCheckIn | date: 'MMM d' }} - {{ selectedCheckOut | date: 'MMM d, y' }}</span>
            </p>
          </div>

          <div class="rooms-grid" *ngIf="rooms.length; else noRooms">
            <mat-card class="room-card" *ngFor="let room of rooms" appearance="outlined">
              <div class="room-badges">
                <span class="badge badge-highlight" *ngIf="isBestPrice(room)">Best price</span>
                <span class="badge" [class.badge-low]="getAvailableRooms(room) <= 3" [class.badge-out]="getAvailableRooms(room) === 0">
                  {{ getAvailabilityLabel(room) }}
                </span>
              </div>

              <div class="room-top">
                <h3>{{ room.name }}</h3>
                <p class="price">{{ room.pricePerNight | currency: 'INR':'symbol':'1.0-0' }} <span>/ night</span></p>
              </div>

              <div class="room-estimate">
                <span class="estimate-label">Estimated total for {{ selectedRooms }} room{{ selectedRooms > 1 ? 's' : '' }} and {{ stayNights }} night{{ stayNights > 1 ? 's' : '' }}</span>
                <span class="estimate-value">{{ estimatedTotal(room) | currency: 'INR':'symbol':'1.0-0' }}</span>
              </div>

              <p class="room-description">{{ room.description }}</p>

              <div class="room-footer">
                <div class="room-facts">
                  <span>Up to {{ room.maxOccupancy }} guests</span>
                  <span>{{ room.bedConfiguration }}</span>
                  <span>{{ getAvailableRooms(room) }} rooms left</span>
                </div>

                <button mat-flat-button color="primary" [disabled]="!canBook(room)" (click)="bookRoom(room)">
                  {{ getBookingButtonText(room) }}
                </button>
              </div>
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

      .booking-card {
        border-radius: 18px;
        border-color: #cfe0f2;
        padding: 20px;
        margin-bottom: 24px;
        background:
          radial-gradient(circle at top right, rgba(5, 150, 105, 0.1), transparent 48%),
          linear-gradient(140deg, rgba(15, 118, 110, 0.07), rgba(234, 179, 8, 0.06));
      }

      .booking-card-header {
        display: flex;
        justify-content: space-between;
        align-items: start;
        gap: 16px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }

      .eyebrow {
        margin: 0 0 8px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.76rem;
        color: #6d7fb8;
        font-weight: 700;
      }

      .booking-card h2 {
        margin: 0;
        color: #0f355a;
      }

      .booking-note {
        margin: 8px 0 0;
        color: #45627d;
        font-size: 0.94rem;
      }

      .booking-summary {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .booking-summary span {
        background: white;
        color: #153e63;
        border: 1px solid #d8e5f2;
        border-radius: 999px;
        padding: 8px 14px;
        font-size: 0.9rem;
        font-weight: 600;
      }

      .booking-form {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }

      .booking-recap {
        margin-top: 8px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 10px;
      }

      .recap-item {
        background: rgba(255, 255, 255, 0.7);
        border: 1px solid #d4e2f0;
        border-radius: 12px;
        padding: 10px 12px;
      }

      .recap-item p {
        margin: 0 0 4px;
        color: #5e7289;
        font-size: 0.78rem;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        font-weight: 700;
      }

      .recap-item strong {
        color: #133f68;
      }

      .selected-window {
        display: inline-block;
        margin-left: 8px;
        font-weight: 700;
        color: #0f4c81;
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
        line-height: 1.5;
      }

      .rooms-grid {
        display: grid;
        gap: 18px;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        max-width: 1080px;
        margin: 0 auto;
      }

      .room-card {
        border-radius: 16px;
        border-color: #cfe0f2;
        background: #fff;
        box-shadow: 0 10px 26px rgba(15, 35, 56, 0.07);
        transition: transform 0.25s ease, box-shadow 0.25s ease;
        padding: 18px;
        display: grid;
        gap: 12px;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 14px 32px rgba(15, 35, 56, 0.1);
        }
      }

      .room-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 2px;
      }

      .badge {
        border-radius: 999px;
        padding: 4px 10px;
        font-size: 0.76rem;
        font-weight: 700;
        letter-spacing: 0.02em;
        color: #4f5f72;
        background: #edf3f9;
      }

      .badge-highlight {
        color: #0f5b4f;
        background: #d8f5e9;
      }

      .badge-low {
        color: #9a3412;
        background: #ffedd5;
      }

      .badge-out {
        color: #7f1d1d;
        background: #fee2e2;
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
        margin: 2px 0;
        color: #4d6278;
        line-height: 1.5;
        min-height: 0;
      }

      .room-estimate {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        margin-bottom: 2px;
        padding: 12px 14px;
        border-radius: 12px;
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08));
        border: 1px solid rgba(102, 126, 234, 0.12);
      }

      .estimate-label {
        color: #5e7289;
        font-size: 0.85rem;
        font-weight: 600;
      }

      .estimate-value {
        color: #0f4c81;
        font-size: 1rem;
        font-weight: 800;
        white-space: nowrap;
      }

      .room-footer {
        display: grid;
        gap: 8px;
      }

      .room-facts {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .room-facts span {
        color: #27425f;
        background: #eff5fb;
        border-radius: 10px;
        padding: 6px 11px;
        font-size: 0.86rem;
        font-weight: 600;
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
        border-radius: 12px;
        margin-top: 2px;
        min-height: 46px;
      }

      button[mat-flat-button][disabled] {
        opacity: 0.65;
        cursor: not-allowed;
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

        .room-estimate {
          flex-direction: column;
          align-items: flex-start;
        }

        .booking-form {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class HotelDetailComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly searchService = inject(SearchService);
  private readonly hotelService = inject(HotelService);
  private readonly bookingService = inject(BookingService);
  private readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);

  hotel: Hotel | null = null;
  rooms: RoomType[] = [];
  availableByRoomType: Record<string, number> = {};
  isLoading = true;
  fallbackImage = 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=1600&auto=format&fit=crop';

  bookingForm = this.fb.group({
    checkIn: [this.createDefaultCheckIn(), Validators.required],
    checkOut: [this.createDefaultCheckOut(), Validators.required],
    guests: [1, [Validators.required, Validators.min(1)]]
  });

  get selectedCheckIn(): Date {
    return this.bookingForm.controls.checkIn.value ?? this.createDefaultCheckIn();
  }

  get selectedCheckOut(): Date {
    return this.bookingForm.controls.checkOut.value ?? this.createDefaultCheckOut();
  }

  get selectedRooms(): number {
    return this.bookingForm.controls.guests.value ?? 1;
  }

  get minCheckInDate(): Date {
    return this.createDefaultCheckIn();
  }

  get minCheckOutDate(): Date {
    const minCheckOut = new Date(this.selectedCheckIn);
    minCheckOut.setHours(0, 0, 0, 0);
    minCheckOut.setDate(minCheckOut.getDate() + 1);
    return minCheckOut;
  }

  get stayNights(): number {
    return this.calculateNights(this.selectedCheckIn, this.selectedCheckOut);
  }

  ngOnInit(): void {
    const hotelId = this.route.snapshot.paramMap.get('id');
    const checkIn = this.parseDateParam(this.route.snapshot.queryParamMap.get('checkIn')) ?? this.createDefaultCheckIn();
    const checkOut = this.parseDateParam(this.route.snapshot.queryParamMap.get('checkOut')) ?? this.createDefaultCheckOut();
    const guests = Number(this.route.snapshot.queryParamMap.get('guests') ?? 1);

    this.bookingForm.patchValue({
      checkIn,
      checkOut,
      guests: Number.isFinite(guests) && guests > 0 ? guests : 1
    });

    this.normalizeBookingWindow();

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
        this.refreshAvailability();
        this.bookingForm.controls.checkIn.valueChanges.subscribe(() => this.refreshAvailability());
        this.bookingForm.controls.checkOut.valueChanges.subscribe(() => this.refreshAvailability());
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

    if (this.isCheckInInPast()) {
      this.notification.error('Check-in date has already passed. Please select today or a future date.');
      return;
    }

    if (!this.canBook(room)) {
      this.notification.info('Selected room count is not available for these dates.');
      return;
    }

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.normalizeBookingWindow();

    const nights = this.calculateNights(this.selectedCheckIn, this.selectedCheckOut);

    this.bookingService
      .createHold({
        hotelId: this.hotel.id,
        roomTypeId: room.id,
        hotelName: this.hotel.name,
        roomTypeName: room.name,
        checkIn: this.toDateOnly(this.selectedCheckIn),
        checkOut: this.toDateOnly(this.selectedCheckOut),
        guests: this.selectedRooms,
        totalAmount: room.pricePerNight * nights * this.selectedRooms
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

  private normalizeBookingWindow(): void {
    const checkIn = new Date(this.selectedCheckIn);
    checkIn.setHours(0, 0, 0, 0);

    const checkOut = new Date(this.selectedCheckOut);
    checkOut.setHours(0, 0, 0, 0);

    if (checkOut <= checkIn) {
      checkOut.setDate(checkIn.getDate() + 1);
      this.bookingForm.patchValue({ checkOut }, { emitEvent: false });
    }
  }

  private createDefaultCheckIn(): Date {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  private createDefaultCheckOut(): Date {
    const nextDay = this.createDefaultCheckIn();
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay;
  }

  private isCheckInInPast(): boolean {
    const checkIn = new Date(this.selectedCheckIn);
    checkIn.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return checkIn < today;
  }

  private parseDateParam(value: string | null): Date | null {
    if (!value) {
      return null;
    }

    const [year, month, day] = value.split('-').map((part) => Number(part));

    if ([year, month, day].some((part) => Number.isNaN(part))) {
      return null;
    }

    const date = new Date(year, month - 1, day);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private toDateOnly(date: Date): string {
    const local = new Date(date);
    local.setHours(0, 0, 0, 0);

    const year = local.getFullYear();
    const month = `${local.getMonth() + 1}`.padStart(2, '0');
    const day = `${local.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private calculateNights(checkIn: Date, checkOut: Date): number {
    const normalizedIn = new Date(checkIn);
    normalizedIn.setHours(0, 0, 0, 0);

    const normalizedOut = new Date(checkOut);
    normalizedOut.setHours(0, 0, 0, 0);

    if (normalizedOut <= normalizedIn) {
      return 1;
    }

    return Math.ceil((normalizedOut.getTime() - normalizedIn.getTime()) / 86_400_000);
  }

  estimatedTotal(room: RoomType): number {
    return room.pricePerNight * this.stayNights * this.selectedRooms;
  }

  getAvailableRooms(room: RoomType): number {
    return this.availableByRoomType[room.id] ?? room.totalRooms;
  }

  canBook(room: RoomType): boolean {
    return this.getAvailableRooms(room) >= this.selectedRooms;
  }

  getBookingButtonText(room: RoomType): string {
    if (!this.canBook(room)) {
      return 'Not available for selected rooms';
    }

    return `Book ${this.selectedRooms} room${this.selectedRooms > 1 ? 's' : ''} for ${this.stayNights} night${this.stayNights > 1 ? 's' : ''}`;
  }

  getAvailabilityLabel(room: RoomType): string {
    const available = this.getAvailableRooms(room);

    if (available === 0) {
      return 'Sold out';
    }

    return `Only ${available} left`;
  }

  isBestPrice(room: RoomType): boolean {
    if (!this.rooms.length) {
      return false;
    }

    const lowest = Math.min(...this.rooms.map((item) => item.pricePerNight));
    return room.pricePerNight === lowest;
  }

  private refreshAvailability(): void {
    if (!this.hotel) {
      return;
    }

    if (this.isCheckInInPast()) {
      return;
    }

    this.normalizeBookingWindow();

    this.bookingService
      .getRoomAvailability(this.hotel.id, this.toDateOnly(this.selectedCheckIn), this.toDateOnly(this.selectedCheckOut))
      .subscribe({
        next: (availability) => {
          this.availableByRoomType = availability.reduce<Record<string, number>>((map, item) => {
            map[item.roomTypeId] = item.availableUnits;
            return map;
          }, {});
        },
        error: () => {
          this.availableByRoomType = {};
        }
      });
  }
}
