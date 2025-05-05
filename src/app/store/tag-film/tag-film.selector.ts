import { createSelector, createFeatureSelector } from '@ngrx/store';
import { TagFilmState } from './tag-film.reducer';

export const selectTagFilmState =
  createFeatureSelector<TagFilmState>('tagFilm');

export const selectTagList = createSelector(
  selectTagFilmState,
  (state) => state.tags
);

/* cách dùng

--lấy dữ liệu--
tags$: Observable<ITagFilmResponse[]>;

constructor(private store: Store) {
  this.tags$ = this.store.select(selectTagList);
}

--ghi dữ liệu--


//Thêm 1 tag
const newTag: ITagFilmResponse = {
      id: Date.now().toString(), // Tạo ID tạm thời
      name: this.tagName,
      description: this.tagDescription,
      type: 'default',
      createdAt: new Date().toISOString(),
    };
this.store.dispatch(addTag({ tag: newTag }));

//thêm 1 danh sách tag
const newTags: ITagFilmResponse[] = [
  { id: '1', name: 'Action', description: 'Phim hành động', type: 'genre', createdAt: new Date().toISOString() },
  { id: '2', name: 'Comedy', description: 'Phim hài', type: 'genre', createdAt: new Date().toISOString() },
];

this.store.dispatch(addTagList({ tags: newTags }));


//xoá 1 tag
this.store.dispatch(removeTag({ id: '1' }));

//hoặc xoá 1 list tags
const tagIdsToRemove = ['1', '2', '3'];
this.store.dispatch(removeTagList({ ids: tagIdsToRemove }));

*/
