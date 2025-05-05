import { createReducer, on } from '@ngrx/store';
import { login, logout } from './auth.actions';

export interface AuthState {
  isAuthenticated: boolean;
  tokenChecked: boolean;
  // các thuộc tính khác
}

const initialState: AuthState = {
  isAuthenticated: false,
  tokenChecked: false,
};

export const authReducer = createReducer(
  initialState,
  on(login, (state) => ({
    ...state,
    isAuthenticated: true,
    tokenChecked: true,
  })),
  on(logout, (state) => ({
    ...state,
    isAuthenticated: false,
    tokenChecked: false,
  }))
);
