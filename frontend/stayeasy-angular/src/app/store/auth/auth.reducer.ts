import { createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { initialAuthState } from './auth.state';

export const authFeatureKey = 'auth';

export const authReducer = createReducer(
  initialAuthState,
  on(AuthActions.login, (state) => ({ ...state, isLoading: true, error: null })),
  on(AuthActions.loginSuccess, (state, { user }) => ({
    ...state,
    user,
    accessToken: user.accessToken,
    isLoggedIn: true,
    isLoading: false,
    error: null
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  on(AuthActions.register, (state) => ({ ...state, isLoading: true, error: null })),
  on(AuthActions.registerSuccess, (state) => ({ ...state, isLoading: false })),
  on(AuthActions.registerFailure, (state, { error }) => ({ ...state, isLoading: false, error })),
  on(AuthActions.setUser, (state, { user }) => ({
    ...state,
    user,
    accessToken: user?.accessToken ?? null,
    isLoggedIn: !!user
  })),
  on(AuthActions.logout, () => initialAuthState),
  on(AuthActions.clearError, (state) => ({ ...state, error: null }))
);
