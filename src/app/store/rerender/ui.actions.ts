import { createAction, props } from '@ngrx/store';

export const toggleState = createAction(
  '[UI] Toggle State',
  props<{ key: string; value: boolean }>()
);
