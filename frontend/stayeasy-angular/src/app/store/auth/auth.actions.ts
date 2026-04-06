import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { LoginRequest, RegisterRequest, User } from '../../models/user.model';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    Login: props<{ credentials: LoginRequest }>(),
    'Login Success': props<{ user: User }>(),
    'Login Failure': props<{ error: string }>(),
    Register: props<{ request: RegisterRequest }>(),
    'Register Success': emptyProps(),
    'Register Failure': props<{ error: string }>(),
    Logout: emptyProps(),
    'Set User': props<{ user: User | null }>(),
    'Clear Error': emptyProps()
  }
});
