import { createReducer, on } from '@ngrx/store';
import { toggleState } from './ui.actions';

export interface UIState {
  [key: string]: boolean;
}

export const initialState: UIState = {
  isReloadOptionMenu: true,
  isReloadOptionSidebar: true,
};

export const uiReducer = createReducer(
  initialState,
  on(toggleState, (state, { key, value }) => ({
    ...state,
    [key]: value,
  }))
);
