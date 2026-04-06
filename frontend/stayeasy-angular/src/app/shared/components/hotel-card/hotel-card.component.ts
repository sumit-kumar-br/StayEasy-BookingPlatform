import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Params, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Hotel } from '../../../models/hotel.model';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-hotel-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, StarRatingComponent],
  templateUrl: './hotel-card.component.html',
  styleUrl: './hotel-card.component.scss'
})
export class HotelCardComponent {
  @Input({ required: true }) hotel!: Hotel;
  @Input() queryParams: Params = {};
  @Output() view = new EventEmitter<Hotel>();

  constructor(private readonly router: Router) {}

  onView(): void {
    this.router.navigate(['/hotels', this.hotel.id], {
      queryParams: this.queryParams
    });
    this.view.emit(this.hotel);
  }
}
