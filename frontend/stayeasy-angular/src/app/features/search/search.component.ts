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
    <div class="layout">
      <aside>
        <mat-card>
          <h3>Filters</h3>
          <div class="filter-list">
            <mat-checkbox *ngFor="let s of [1,2,3,4,5]" (change)="toggleStar(s, $event.checked)">{{ s }} stars</mat-checkbox>
          </div>

          <label>Max Price</label>
          <mat-slider min="50" max="20000" step="50">
            <input matSliderThumb [(ngModel)]="maxPrice" (valueChange)="reload()" />
          </mat-slider>
          <small>Up to {{ maxPrice | currency : 'INR' : 'symbol' : '1.0-0' }}</small>

          <mat-form-field appearance="outline" class="full">
            <mat-label>Sort by</mat-label>
            <mat-select [(ngModel)]="sortBy" (selectionChange)="reload()">
              <mat-option value="price_asc">Price low-high</mat-option>
              <mat-option value="price_desc">Price high-low</mat-option>
              <mat-option value="stars_desc">Star rating</mat-option>
            </mat-select>
          </mat-form-field>
        </mat-card>
      </aside>

      <section>
        <h2>{{ hotels.length }} hotels found</h2>
        <app-loading-spinner *ngIf="isLoading"></app-loading-spinner>
        <div class="grid" *ngIf="!isLoading && hotels.length">
          <app-hotel-card *ngFor="let hotel of hotels" [hotel]="hotel" [queryParams]="baseParams"></app-hotel-card>
        </div>
        <mat-card *ngIf="!isLoading && !hotels.length">No hotels match your current filters.</mat-card>
      </section>
    </div>
  `,
  styles: [
    `
      .layout {
        max-width: 1200px;
        margin: 20px auto;
        padding: 0 16px;
        display: grid;
        gap: 16px;
        grid-template-columns: 280px 1fr;
      }

      .filter-list {
        display: grid;
        gap: 6px;
        margin-bottom: 12px;
      }

      .full {
        width: 100%;
      }

      .grid {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      }

      @media (max-width: 900px) {
        .layout {
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
