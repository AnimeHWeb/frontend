import { createAction, props } from '@ngrx/store';
import { ITagFilmResponse } from '../../models/InterfaceResponse';

export const loadTags = createAction('[Tag Film] Load Tags');
export const addTagList = createAction(
  '[Tag Film] Add Tag List',
  props<{ tags: ITagFilmResponse[] }>()
);

export const loadTagsSuccess = createAction(
  '[Tag Film] Load Tags Success',
  props<{ tags: ITagFilmResponse[] }>()
);

export const loadTagsFailure = createAction(
  '[Tag Film] Load Tags Failure',
  props<{ error: string }>()
);

export const addTag = createAction(
  '[Tag Film] Add Tag',
  props<{ tag: ITagFilmResponse }>()
);

export const updateTag = createAction(
  '[Tag Film] Update Tag',
  props<{ tag: ITagFilmResponse }>()
);

export const removeTag = createAction(
  '[Tag Film] Remove Tag',
  props<{ id: string }>()
);

export const removeTagList = createAction(
  '[Tag Film] Remove Tag List',
  props<{ ids: string[] }>() // Nhận danh sách ID cần xóa
);
