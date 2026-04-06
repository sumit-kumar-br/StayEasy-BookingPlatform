import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.state';
import { authFeatureKey } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>(authFeatureKey);

export const selectCurrentUser = createSelector(selectAuthState, (state) => state.user);
export const selectIsLoggedIn = createSelector(selectAuthState, (state) => state.isLoggedIn);
export const selectAuthLoading = createSelector(selectAuthState, (state) => state.isLoading);
export const selectAuthError = createSelector(selectAuthState, (state) => state.error);
export const selectAccessToken = createSelector(selectAuthState, (state) => state.accessToken);
