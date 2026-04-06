import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HotelCardComponent } from '../../shared/components/hotel-card/hotel-card.component';
import { SearchService } from '../../core/services/search.service';
import { Hotel, HotelSearchParams } from '../../models/hotel.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatCheckboxModule,
    MatSliderModule,
    MatSelectModule,
    MatFormFieldModule,
    HotelCardComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="search-container">
      <div class="search-header">
        <h1>Search Results</h1>
        <p class="results-count">Found <strong>{{ hotels.length }}</strong> hotels matching your criteria</p>
      </div>

      <div class="layout">
        <aside class="filters-section">
          <mat-card class="filter-card">
            <div class="filter-header">
              <h3>Filters</h3>
            </div>

            <div class="filter-group">
              <h4>Star Rating</h4>
              <div class="filter-list">
                <mat-checkbox *ngFor="let s of [5,4,3,2,1]" (change)="toggleStar(s, $event.checked)" class="star-checkbox">
                  <span class="star-label">★ {{ s }} Star{{ s !== 1 ? 's' : '' }}</span>
                </mat-checkbox>
              </div>
            </div>

            <div class="filter-group">
              <h4>Price Range</h4>
              <mat-slider min="50" max="20000" step="50">
                <input matSliderThumb [(ngModel)]="maxPrice" (valueChange)="reload()" class="price-slider" />
              </mat-slider>
              <div class="price-display">
                <span class="price-text">Up to {{ maxPrice | currency : 'INR' : 'symbol' : '1.0-0' }}</span>
              </div>
            </div>

            <div class="filter-group">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Sort by</mat-label>
                <mat-select [(ngModel)]="sortBy" (selectionChange)="reload()">
                  <mat-option value="price_asc">💰 Price: Low to High</mat-option>
                  <mat-option value="price_desc">💰 Price: High to Low</mat-option>
                  <mat-option value="stars_desc">⭐ Star Rating</mat-option>
                </mat-select>
              </mat-form-field>
            </div>
          </mat-card>
        </aside>

        <section class="results-section">
          <app-loading-spinner *ngIf="isLoading"></app-loading-spinner>
          
          <div class="grid" *ngIf="!isLoading && hotels.length">
            <app-hotel-card *ngFor="let hotel of hotels" [hotel]="hotel" [queryParams]="baseParams"></app-hotel-card>
          </div>

          <mat-card class="no-results" *ngIf="!isLoading && !hotels.length">
            <div class="empty-state">
              <span class="empty-icon">🏨</span>
              <h3>No hotels found</h3>
              <p>Try adjusting your filters or search criteria</p>
            </div>
          </mat-card>
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      .search-container {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        min-height: 100vh;
      }

      .search-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 50px 16px;
        text-align: center;
        position: relative;
        overflow: hidden;

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23ffffff" fill-opacity="0.05"><path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/></g></g></svg>');
          opacity: 0.1;
        }

        h1 {
          margin: 0;
          font-size: 2.8rem;
          font-weight: 800;
          margin-bottom: 12px;
          position: relative;
          z-index: 1;
          letter-spacing: -0.5px;
        }
      }

      .results-count {
        margin: 0;
        font-size: 1.15rem;
        opacity: 0.95;
        font-weight: 400;
        position: relative;
        z-index: 1;

        strong {
          font-weight: 700;
        }
      }

      .layout {
        max-width: 1280px;
        margin: 0 auto;
        padding: 36px 16px;
        display: grid;
        gap: 32px;
        grid-template-columns: 300px 1fr;
      }

      .filters-section {
        height: fit-content;
      }

      .filter-card {
        padding: 24px;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        background: white;
        border: 1px solid rgba(102, 126, 234, 0.1);
        position: sticky;
        top: 20px;
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 4px 16px rgba(102, 126, 234, 0.12);
        }

        .filter-header {
          margin-bottom: 24px;
          border-bottom: 2px solid #667eea;
          padding-bottom: 12px;

          h3 {
            margin: 0;
            color: #1a202c;
            font-weight: 700;
            font-size: 1.2rem;
            display: flex;
            align-items: center;
            gap: 8px;
          }
        }
      }

      .filter-group {
        margin-bottom: 24px;
        padding-bottom: 20px;
        border-bottom: 1px solid #e2e8f0;

        &:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: none;
        }

        h4 {
          margin: 0 0 14px;
          color: #1a202c;
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
      }

      .filter-list {
        display: grid;
        gap: 10px;
      }

      .star-checkbox {
        ::ng-deep .mdc-checkbox__checkmark {
          color: #667eea;
        }

        ::ng-deep .mdc-checkbox--checked .mdc-checkbox__background {
          background-color: #667eea !important;
        }
      }

      .star-label {
        color: #2d3748;
        font-weight: 500;
        font-size: 0.95rem;
      }

      .price-slider {
        width: 100%;
      }

      .price-display {
        margin-top: 16px;
        padding: 14px 12px;
        background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
        border: 1px solid #667eea20;
        border-radius: 8px;
        text-align: center;
      }

      .price-text {
        font-size: 1.1rem;
        font-weight: 700;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .full-width {
        width: 100%;
      }

      .results-section {
        background: white;
        border-radius: 12px;
        padding: 28px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        border: 1px solid rgba(102, 126, 234, 0.1);
      }

      .grid {
        display: grid;
        gap: 24px;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      }

      .no-results {
        text-align: center;
        padding: 80px 20px;
        border: 2px dashed #e0e0e0;
        border-radius: 12px;
        background: #fafafa;
      }

      .empty-state {
        .empty-icon {
          font-size: 5rem;
          display: block;
          margin-bottom: 20px;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
        }

        h3 {
          color: #1a202c;
          margin: 0 0 12px;
          font-size: 1.5rem;
          font-weight: 600;
        }

        p {
          color: #718096;
          margin: 0;
          font-size: 1.05rem;
          line-height: 1.5;
        }
      }

      @media (max-width: 900px) {
        .layout {
          grid-template-columns: 1fr;
        }

        .filters-section {
          height: auto;
        }

        .search-header {
          padding: 30px 16px;

          h1 {
            font-size: 2rem;
          }
        }
      }

      @media (max-width: 600px) {
        .search-header {
          padding: 24px 16px;

          h1 {
            font-size: 1.6rem;
          }
        }

        .results-section {
          padding: 16px;
        }

        .grid {
          grid-template-columns: 1fr;
        }
      }
    `
  ]
})
export class SearchComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly searchService = inject(SearchService);

  hotels: Hotel[] = [];
  isLoading = false;

  selectedStars = new Set<number>();
  readonly defaultMaxPrice = 20000;
  maxPrice = this.defaultMaxPrice;
  sortBy: HotelSearchParams['sortBy'] = 'price_asc';

  baseParams: HotelSearchParams = {};

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.baseParams = {
        city: params.get('city') ?? undefined,
        checkIn: params.get('checkIn') ?? undefined,
        checkOut: params.get('checkOut') ?? undefined,
        guests: Number(params.get('guests') ?? 1)
      };

      this.reload();
    });
  }

  toggleStar(star: number, checked: boolean): void {
    if (checked) {
      this.selectedStars.add(star);
    } else {
      this.selectedStars.delete(star);
    }

    this.reload();
  }

  reload(): void {
    const minStar = this.selectedStars.size ? Math.min(...this.selectedStars) : undefined;
    const maxStar = this.selectedStars.size ? Math.max(...this.selectedStars) : undefined;

    const params: HotelSearchParams = {
      ...this.baseParams,
      minStars: minStar,
      maxStars: maxStar,
      maxPrice: this.maxPrice < this.defaultMaxPrice ? this.maxPrice : undefined,
      sortBy: this.sortBy
    };

    this.isLoading = true;
    this.searchService.searchHotels(params).subscribe({
      next: (hotels) => {
        this.hotels = hotels;
        this.isLoading = false;
      },
      error: () => {
        this.hotels = [];
        this.isLoading = false;
      }
    });
  }

}
