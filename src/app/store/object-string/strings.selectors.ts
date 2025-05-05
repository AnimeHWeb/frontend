import { createFeatureSelector, createSelector } from '@ngrx/store';
import { StringState } from './strings.reducer';

// Lấy feature selector cho listStrings
const getStringState = createFeatureSelector<StringState>('stringList');

// Selector để lấy tất cả các đối tượng trong mảng
export const selectAllStrings = createSelector(
  getStringState,
  (state: StringState) => state.listStrings
);

// Selector để lấy một đối tượng cụ thể theo keyString
export const selectStringByKey = (keyString: string) =>
  createSelector(getStringState, (state: StringState) =>
    state.listStrings.find((item) => item.keyString === keyString)
  );

/*

listStrings$: Observable<{ keyString: string }[]>;
  stringByKey$: Observable<{ keyString: string } | undefined>;

  constructor(private store: Store) {
    // Lấy danh sách tất cả các đối tượng trong store
    this.listStrings$ = this.store.select(selectAllStrings);

    // Lấy đối tượng cụ thể theo keyString
    this.stringByKey$ = this.store.select(selectStringByKey('exampleKey')); // Thay 'exampleKey' bằng key bạn muốn tìm
  }

  // Thêm một đối tượng string vào mảng
  addNewString(keyString: string): void {
    this.store.dispatch(addString({ keyString }));
  }

  // Xóa một đối tượng string khỏi mảng
  removeString(keyString: string): void {
    this.store.dispatch(removeString({ keyString }));
  }


  */
