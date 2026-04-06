import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { animate, style, transition, trigger } from '@angular/animations';
import { HotelCardComponent } from '../../shared/components/hotel-card/hotel-card.component';
import { SearchService } from '../../core/services/search.service';
import { Hotel } from '../../models/hotel.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    HotelCardComponent,
    LoadingSpinnerComponent
  ],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('450ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  template: `
    <section class="hero">
      <div class="overlay">
        <div class="hero-content" [@fadeInUp]>
          <h1 class="hero-title">Find your perfect stay</h1>
          <p class="subtitle">Luxury hotels, effortless booking, unforgettable trips.</p>
        </div>

        <div class="search-panel" [@fadeInUp]>
          <form [formGroup]="form" (ngSubmit)="search()" class="search-grid">
            <mat-form-field appearance="outline">
              <mat-label>Destination</mat-label>
              <input matInput formControlName="city" />
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Check-in</mat-label>
              <input matInput [matDatepicker]="checkInPicker" formControlName="checkIn" />
              <mat-datepicker-toggle matIconSuffix [for]="checkInPicker"></mat-datepicker-toggle>
              <mat-datepicker #checkInPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Check-out</mat-label>
              <input matInput [matDatepicker]="checkOutPicker" formControlName="checkOut" />
              <mat-datepicker-toggle matIconSuffix [for]="checkOutPicker"></mat-datepicker-toggle>
              <mat-datepicker #checkOutPicker></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Guests</mat-label>
              <input matInput type="number" min="1" formControlName="guests" />
            </mat-form-field>

            <button mat-raised-button color="accent" type="submit" class="search-btn">
              Search Hotels
            </button>
          </form>
        </div>
      </div>
    </section>

    <section class="content">
      <div class="section-header">
        <h2>Featured Hotels</h2>
        <p class="section-subtitle">Discover our carefully selected luxury destinations</p>
      </div>
      <app-loading-spinner *ngIf="isLoading"></app-loading-spinner>

      <div class="grid" *ngIf="!isLoading">
        <app-hotel-card *ngFor="let hotel of featuredHotels" [hotel]="hotel"></app-hotel-card>
      </div>
    </section>
  `,
  styles: [
    `
      .hero {
        min-height: 580px;
        position: relative;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%),
          url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1920&auto=format&fit=crop')
          center/cover;
        background-blend-mode: overlay;
        display: flex;
        align-items: center;
      }

      .hero::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(102deg, rgba(8, 30, 58, 0.75), rgba(17, 74, 124, 0.6));
        transition: opacity 0.3s ease;
      }

      .overlay {
        position: relative;
        z-index: 1;
        max-width: 1120px;
        margin: 0 auto;
        padding: 68px 16px;
        color: #f3f8ff;
        width: 100%;
      }

      .hero-content {
        margin-bottom: 32px;
      }

      .hero-title {
        margin: 0;
        font-size: clamp(2.2rem, 5vw, 3.5rem);
        letter-spacing: 0.2px;
        font-weight: 700;
        line-height: 1.2;
        text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
      }

      .subtitle {
        margin: 16px 0 0;
        color: #d9e9fb;
        font-size: 1.15rem;
        font-weight: 300;
        text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
      }

      .search-panel {
        background: rgba(247, 251, 255, 0.95);
        border-radius: 16px;
        padding: 28px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.2);
      }

      .search-grid {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        align-items: end;
      }

      .search-btn {
        min-height: 56px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 6px 16px rgba(102, 126, 234, 0.6);
          transform: translateY(-2px);
        }
      }

      .search-panel ::ng-deep .mat-mdc-text-field-wrapper {
        background: rgba(255, 255, 255, 0.98);
      }

      .search-panel ::ng-deep .mat-mdc-form-field-label {
        color: #0f2742 !important;
      }

      .search-panel ::ng-deep .mdc-text-field--outlined .mdc-notched-outline__leading,
      .search-panel ::ng-deep .mdc-text-field--outlined .mdc-notched-outline__notch,
      .search-panel ::ng-deep .mdc-text-field--outlined .mdc-notched-outline__trailing {
        border-color: #e0e0e0 !important;
      }

      .search-panel ::ng-deep .mdc-text-field--focused .mdc-notched-outline__leading,
      .search-panel ::ng-deep .mdc-text-field--focused .mdc-notched-outline__notch,
      .search-panel ::ng-deep .mdc-text-field--focused .mdc-notched-outline__trailing {
        border-color: #667eea !important;
      }

      .content {
        max-width: 1120px;
        margin: 48px auto;
        padding: 0 16px;
      }

      .section-header {
        text-align: center;
        margin-bottom: 40px;
      }

      h2 {
        color: #0f2742;
        font-size: 2rem;
        margin: 0 0 8px;
        font-weight: 700;
      }

      .section-subtitle {
        color: #64748b;
        font-size: 1.05rem;
        margin: 0;
        font-weight: 300;
      }

      .grid {
        display: grid;
        gap: 20px;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      }

      @media (max-width: 768px) {
        .hero {
          min-height: 480px;
        }

        .overlay {
          padding: 44px 16px;
        }

        .hero-title {
          font-size: 2rem;
        }

        .subtitle {
          font-size: 0.95rem;
        }

        .search-panel {
          padding: 20px;
        }

        .search-grid {
          gap: 12px;
        }

        .grid {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class HomeComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly searchService = inject(SearchService);

  featuredHotels: Hotel[] = [];
  isLoading = false;

  form = this.fb.group({
    city: ['', Validators.required],
    checkIn: [new Date(), Validators.required],
    checkOut: [new Date(Date.now() + 86_400_000), Validators.required],
    guests: [1, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    this.isLoading = true;
    this.searchService.searchHotels({}).subscribe({
      next: (hotels) => {
        this.featuredHotels = hotels.slice(0, 6);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  search(): void {
    const value = this.form.getRawValue();
    this.router.navigate(['/hotels/search'], {
      queryParams: {
        city: value.city,
        checkIn: this.toIsoDate(value.checkIn),
        checkOut: this.toIsoDate(value.checkOut),
        guests: value.guests
      }
    });
  }

  private toIsoDate(date: Date | null): string {
    return date ? date.toISOString().split('T')[0] : '';
  }
}
