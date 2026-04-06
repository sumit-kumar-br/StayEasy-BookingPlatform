import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="spinner-wrap" [class.full]="fullPage">
      <mat-spinner diameter="42"></mat-spinner>
    </div>
  `,
  styles: [
    `
      .spinner-wrap {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 120px;
      }

      .spinner-wrap.full {
        min-height: 50vh;
      }
    `
  ]
})
export class LoadingSpinnerComponent {
  @Input() fullPage = false;
}
