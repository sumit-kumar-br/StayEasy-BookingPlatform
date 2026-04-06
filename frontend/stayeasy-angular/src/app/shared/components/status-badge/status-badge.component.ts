import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="badge" [ngClass]="statusClass">{{ status }}</span>`,
  styleUrl: './status-badge.component.scss'
})
export class StatusBadgeComponent {
  @Input() status = 'Unknown';

  get statusClass(): string {
    const value = this.status.toLowerCase();

    if (value.includes('pending')) {
      return 'pending';
    }
    if (value.includes('confirm') || value.includes('approve')) {
      return 'confirmed';
    }
    if (value.includes('cancel') || value.includes('reject') || value.includes('suspend')) {
      return 'cancelled';
    }
    if (value.includes('checkin')) {
      return 'checked-in';
    }

    return 'default';
  }
}
