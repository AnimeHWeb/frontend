import { createAction, props } from '@ngrx/store';

// Action để thêm một đối tượng string vào mảng
export const addString = createAction(
  '[String List] Add String',
  props<{ keyString: string }>()
);

// Action để xóa một đối tượng string khỏi mảng
export const removeString = createAction(
  '[String List] Remove String',
  props<{ keyString: string }>()
);

// Action để lấy toàn bộ mảng các đối tượng
export const loadStrings = createAction('[String List] Load Strings');

// Action để lấy một đối tượng cụ thể theo keyString
export const selectStringByKey = createAction(
  '[String List] Select String By Key',
  props<{ keyString: string }>()
);
