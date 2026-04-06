import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <div>© 2026 StayEasy</div>
      <nav>
        <a routerLink="/">Home</a>
        <a routerLink="/hotels/search">Search</a>
        <a routerLink="/dashboard/bookings">My Bookings</a>
      </nav>
    </footer>
  `,
  styles: [
    `
      .footer {
        margin-top: 32px;
        padding: 20px;
        background: #eef4fa;
        color: #1f2937;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      nav {
        display: flex;
        gap: 14px;
      }

      a {
        color: #0f4c81;
        text-decoration: none;
      }
    `
  ]
})
export class FooterComponent {}
