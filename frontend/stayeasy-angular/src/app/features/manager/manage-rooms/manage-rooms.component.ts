import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { HotelService } from '../../../core/services/hotel.service';
import { RoomType } from '../../../models/room-type.model';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-manage-rooms',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule
  ],
  template: `
    <section class="container">
      <h1>Manage Rooms</h1>

      <mat-card>
        <form [formGroup]="form" (ngSubmit)="addRoom()" class="form">
          <mat-form-field appearance="outline"><mat-label>Name</mat-label><input matInput formControlName="name" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Description</mat-label><textarea matInput formControlName="description"></textarea></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Max Occupancy</mat-label><input matInput type="number" formControlName="maxOccupancy" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Price per night</mat-label><input matInput type="number" formControlName="pricePerNight" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Total Rooms</mat-label><input matInput type="number" formControlName="totalRooms" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Bed Configuration</mat-label><input matInput formControlName="bedConfiguration" /></mat-form-field>
          <button mat-flat-button color="primary" [disabled]="form.invalid">Add Room Type</button>
        </form>
      </mat-card>

      <div class="list">
        <mat-card *ngFor="let room of rooms">
          <h3>{{ room.name }}</h3>
          <p>{{ room.description }}</p>
          <p>{{ room.pricePerNight | currency }} / night</p>
          <button mat-button color="warn" (click)="deleteRoom(room)">Delete</button>
        </mat-card>
      </div>
    </section>
  `,
  styles: [
    `
      .container { max-width: 900px; margin: 20px auto; padding: 0 16px; }
      .form { display: grid; gap: 12px; }
      .list { margin-top: 16px; display: grid; gap: 12px; }
    `
  ]
})
export class ManageRoomsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly hotelService = inject(HotelService);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);

  hotelId = '';
  rooms: RoomType[] = [];

  form = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    maxOccupancy: [2, Validators.required],
    pricePerNight: [100, Validators.required],
    totalRooms: [1, Validators.required],
    bedConfiguration: ['1 Queen', Validators.required]
  });

  ngOnInit(): void {
    this.hotelId = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadRooms();
  }

  loadRooms(): void {
    if (!this.hotelId) {
      return;
    }

    this.hotelService.getRoomTypes(this.hotelId).subscribe((rooms) => {
      this.rooms = rooms;
    });
  }

  addRoom(): void {
    if (this.form.invalid || !this.hotelId) {
      return;
    }

    const value = this.form.getRawValue();
    this.hotelService
      .createRoomType(this.hotelId, {
        name: value.name ?? '',
        description: value.description ?? '',
        maxOccupancy: value.maxOccupancy ?? 2,
        pricePerNight: value.pricePerNight ?? 100,
        totalRooms: value.totalRooms ?? 1,
        bedConfiguration: value.bedConfiguration ?? '1 Queen'
      })
      .subscribe(() => {
        this.form.reset({
          maxOccupancy: 2,
          pricePerNight: 100,
          totalRooms: 1,
          bedConfiguration: '1 Queen'
        });
        this.loadRooms();
      });
  }

  deleteRoom(room: RoomType): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete room type',
        message: `Delete ${room.name}?`,
        confirmText: 'Delete'
      }
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed || !this.hotelId) {
        return;
      }

      this.hotelService.deleteRoomType(this.hotelId, room.id).subscribe(() => this.loadRooms());
    });
  }
}
