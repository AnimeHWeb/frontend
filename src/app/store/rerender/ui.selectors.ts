import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UIState } from './ui.reducer';

export const selectUIState = createFeatureSelector<UIState>('uiState');

export const selectBooleanState = (key: string) =>
  createSelector(selectUIState, (state) => state[key] ?? false);
