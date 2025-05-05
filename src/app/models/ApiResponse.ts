import { IUser, IThumbnailCard } from './InterfaceData';

export type ApiResponse = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: IUser[];
};

export type ApiVideoFakeResponse = {
  data: IThumbnailCard[];
};

export type SERVER_RESPONSE<T> = {
  code: number;
  message: string;
  status: string;
  result: T;
};
