import { createReducer, on } from '@ngrx/store';
import {
  addString,
  removeString,
  loadStrings,
  selectStringByKey,
} from './strings.actions';

// Định nghĩa state ban đầu
export interface StringState {
  listStrings: { keyString: string }[];
}

export const initialState: StringState = {
  listStrings: [],
};

// Reducer để xử lý các actions
export const stringReducer = createReducer(
  initialState,
  on(addString, (state, { keyString }) => ({
    ...state,
    listStrings: [...state.listStrings, { keyString }],
  })),
  on(removeString, (state, { keyString }) => ({
    ...state,
    listStrings: state.listStrings.filter(
      (item) => item.keyString !== keyString
    ),
  })),
  on(loadStrings, (state) => state), // Giữ nguyên state hiện tại khi load
  on(selectStringByKey, (state, { keyString }) => ({
    ...state,
    // Không thay đổi gì trong state, nhưng có thể dùng để trigger logic khác
  }))
);
