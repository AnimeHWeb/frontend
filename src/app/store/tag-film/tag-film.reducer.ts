import { createReducer, on } from '@ngrx/store';
import {
  loadTagsSuccess,
  addTag,
  updateTag,
  removeTag,
  addTagList,
  removeTagList,
} from './tag-film.actions';
import { ITagFilmResponse } from '../../models/InterfaceResponse';

export interface TagFilmState {
  tags: ITagFilmResponse[];
}

const initialState: TagFilmState = {
  tags: [],
};

export const tagFilmReducer = createReducer(
  initialState,
  on(loadTagsSuccess, (state, { tags }) => ({
    ...state,
    tags,
  })),
  on(addTag, (state, { tag }) => ({
    ...state,
    tags: [...state.tags, tag],
  })),
  on(addTagList, (state, { tags }) => ({
    ...state,
    tags: [...state.tags, ...tags],
  })),
  on(updateTag, (state, { tag }) => ({
    ...state,
    tags: state.tags.map((t) => (t.id === tag.id ? tag : t)),
  })),
  on(removeTag, (state, { id }) => ({
    ...state,
    tags: state.tags.filter((t) => t.id !== id),
  })),
  on(removeTagList, (state, { ids }) => ({
    ...state,
    tags: state.tags.filter((t) => !ids.includes(t.id)), // Lọc bỏ các tag có ID trong danh sách
  }))
);
