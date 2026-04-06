import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { UserRole } from '../../../models/user.model';
import { AuthActions } from '../../../store/auth/auth.actions';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <mat-card class="card">
      <h2>Create Account</h2>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <mat-form-field appearance="outline">
          <mat-label>Full name</mat-label>
          <input matInput formControlName="fullName" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Password</mat-label>
          <input matInput type="password" formControlName="password" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Role</mat-label>
          <mat-select formControlName="role">
            <mat-option [value]="roles.Traveler">Traveler</mat-option>
            <mat-option [value]="roles.HotelManager">Hotel Manager</mat-option>
            <mat-option [value]="roles.Admin">Admin</mat-option>
          </mat-select>
        </mat-form-field>

        <button mat-flat-button color="primary" type="submit" [disabled]="form.invalid">Register</button>
      </form>
      <p>Already have an account? <a routerLink="/login">Login</a></p>
    </mat-card>
  `,
  styles: [
    `
      .card {
        max-width: 520px;
        margin: 32px auto;
        padding: 24px;
      }

      form {
        display: grid;
        gap: 12px;
      }
    `
  ]
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);

  roles = UserRole;

  form = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: [UserRole.Traveler, Validators.required]
  });

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.store.dispatch(
      AuthActions.register({
        request: {
          fullName: this.form.value.fullName ?? '',
          email: this.form.value.email ?? '',
          password: this.form.value.password ?? '',
          role: this.form.value.role ?? UserRole.Traveler
        }
      })
    );
  }
}
