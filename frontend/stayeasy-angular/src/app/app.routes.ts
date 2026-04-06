import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { UserRole } from './models/user.model';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent)
	},
	{
		path: 'login',
		loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent)
	},
	{
		path: 'register',
		loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent)
	},
	{
		path: 'verify-email',
		loadComponent: () => import('./features/auth/verify-email/verify-email.component').then((m) => m.VerifyEmailComponent)
	},
	{
		path: 'workspace',
		canActivate: [authGuard],
		loadComponent: () => import('./features/workspace/workspace.component').then((m) => m.WorkspaceComponent)
	},
	{
		path: 'hotels/search',
		loadComponent: () => import('./features/search/search.component').then((m) => m.SearchComponent)
	},
	{
		path: 'hotels/:id',
		loadComponent: () => import('./features/hotel-detail/hotel-detail.component').then((m) => m.HotelDetailComponent)
	},
	{
		path: 'checkout',
		canActivate: [authGuard, roleGuard],
		data: { roles: [UserRole.Traveler] },
		loadComponent: () => import('./features/checkout/checkout.component').then((m) => m.CheckoutComponent)
	},
	{
		path: 'booking-confirmation/:id',
		canActivate: [authGuard],
		loadComponent: () =>
			import('./features/booking-confirmation/booking-confirmation.component').then(
				(m) => m.BookingConfirmationComponent
			)
	},
	{
		path: 'dashboard',
		canActivate: [authGuard, roleGuard],
		data: { roles: [UserRole.Traveler] },
		loadComponent: () =>
			import('./features/dashboard/traveler-dashboard/traveler-dashboard.component').then(
				(m) => m.TravelerDashboardComponent
			)
	},
	{
		path: 'dashboard/bookings',
		canActivate: [authGuard, roleGuard],
		data: { roles: [UserRole.Traveler] },
		loadComponent: () =>
			import('./features/dashboard/my-bookings/my-bookings.component').then((m) => m.MyBookingsComponent)
	},
	{
		path: 'dashboard/bookings/:id',
		canActivate: [authGuard, roleGuard],
		data: { roles: [UserRole.Traveler] },
		loadComponent: () => import('./features/dashboard/booking-detail.component').then((m) => m.BookingDetailComponent)
	},
	{
		path: 'manager/dashboard',
		canActivate: [authGuard, roleGuard],
		data: { roles: [UserRole.HotelManager] },
		loadComponent: () =>
			import('./features/manager/dashboard/manager-dashboard.component').then(
				(m) => m.ManagerDashboardComponent
			)
	},
	{
		path: 'manager/hotels',
		canActivate: [authGuard, roleGuard],
		data: { roles: [UserRole.HotelManager] },
		loadComponent: () => import('./features/manager/my-hotels/my-hotels.component').then((m) => m.MyHotelsComponent)
	},
	{
		path: 'manager/hotels/new',
		canActivate: [authGuard, roleGuard],
		data: { roles: [UserRole.HotelManager] },
		loadComponent: () => import('./features/manager/add-hotel/add-hotel.component').then((m) => m.AddHotelComponent)
	},
	{
		path: 'manager/hotels/:id/edit',
		canActivate: [authGuard, roleGuard],
		data: { roles: [UserRole.HotelManager] },
		loadComponent: () => import('./features/manager/edit-hotel/edit-hotel.component').then((m) => m.EditHotelComponent)
	},
	{
		path: 'manager/hotels/:id/rooms',
		canActivate: [authGuard, roleGuard],
		data: { roles: [UserRole.HotelManager] },
		loadComponent: () =>
			import('./features/manager/manage-rooms/manage-rooms.component').then((m) => m.ManageRoomsComponent)
	},
	{
		path: 'manager/bookings',
		canActivate: [authGuard, roleGuard],
		data: { roles: [UserRole.HotelManager] },
		loadComponent: () =>
			import('./features/manager/incoming-bookings/incoming-bookings.component').then(
				(m) => m.IncomingBookingsComponent
			)
	},
	{
		path: 'admin/dashboard',
		canActivate: [authGuard, roleGuard],
		data: { roles: [UserRole.Admin] },
		loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent)
	},
	{
		path: 'admin/hotels',
		canActivate: [authGuard, roleGuard],
		data: { roles: [UserRole.Admin] },
		loadComponent: () =>
			import('./features/admin/hotel-management/hotel-management.component').then(
				(m) => m.HotelManagementComponent
			)
	},
	{
		path: 'admin/users',
		canActivate: [authGuard, roleGuard],
		data: { roles: [UserRole.Admin] },
		loadComponent: () => import('./features/admin/users/admin-users.component').then((m) => m.AdminUsersComponent)
	},
	{
		path: '**',
		redirectTo: ''
	}
];
