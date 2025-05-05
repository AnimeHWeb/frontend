import { NotificationType } from '../components/regular/alert-notification/alert-notification.component';
import { IEpisodeInAnimeResponse } from './InterfaceResponse';

export interface ISeason {
  value: number;
  label: string;
}

export interface IMovie {
  id: string;
  title: string;
  description: string;
  background: string;
  thumbnail: string;
  trailer: string;
  totalView: number;
  newEpisodes: IEpisodeInAnimeResponse[];
  totalEpisodes: IEpisodeInAnimeResponse[];
  releaseDate: string;
  rating: number;
  numberOfRating: number;
  genres: string[];
  followers: number;
  status: string;
  country: string;
  studio: string;
  schedule: string;
  seasons: ISeason[];
  follow: boolean;
  submittedBy: string;
}

export interface IMovieUpdate {
  title?: string;
  description?: string;
  releaseYear?: number;
  director?: string;
  expectedEpisodes?: number;
  trailerUrl?: string;
  seriesOrder?: string;
  // Trong trường hợp gửi dữ liệu dưới dạng multipart/form-data, các file sẽ được xử lý riêng.
  // Tuy nhiên, nếu định nghĩa JSON thì bạn có thể sử dụng File hoặc string (ví dụ base64) tùy theo cách xử lý.
  posterFile?: File;
  bannerFile?: File;
  movieTypes?: string[];
  statusNames?: string[];
  releaseYearNames?: string[];
  studioNames?: string[];
  scheduleNames?: string[];
  genreNames?: string[];
  countryNames?: string[];
}

export interface IDataCreateNewComment {
  animeId: string;
  content: string;
}

export interface IDataReplyComment {
  animeId: string;
  parentId: string;
  content: string;
}

export interface INotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
}

export interface IUpdateProfileAccount {
  displayName: string;
  fullName: string;
  gender: boolean | null;
  bio: string;
  phoneNumber: string;
}

export interface IUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
}

export interface IGuestRequestModerator {
  username: string;
  password: string;
  email: string;
  fullName: string;
  cccd: string;
  phoneNumber: string;
}

export interface IUserRequestModerator {
  fullName: string;
  cccd: string;
  phoneNumber: string;
}

export interface IOptionItem {
  id: number | string;
  label: string;
  icon: string;
  role: {
    ROLE_GUEST: boolean;
    ROLE_USER: boolean;
    ROLE_ADMIN: boolean;
    ROLE_MODERATOR: boolean;
  };
}

export interface IListThumbnails {
  category: string;
  useApi: 'FAA' | 'FAE' | 'FAS' | 'FES';
  query?: IQueries;
  videos: IThumbnailCard[];
}

export interface IQueries {
  movieQueries?: IMovieQuery;
  episodeQueries?: IEpisodeQuery;
  scheduleQueries?: IScheduleFilterData;
}

export interface IThumbnailCard {
  id: string;
  title: string;
  videoUrl: string;
  thumbnail: string;
  description: string;
  duration: string;
  ep: number;
  total_ep: number;
  rating: number;
  view: number;
}

export interface IUrlImage {
  mainBanner: string;
  secondBanner: {
    imgFirst: string;
    imgSecond: string;
    imgThird: string;
  };
}

export interface ITagFilm {
  value: number;
  label: string;
  disabled?: boolean;
}

export interface ICreateTagType {
  name: string;
  type:
    | 'Loại phim'
    | 'Tình trạng'
    | 'Thể loại'
    | 'Lịch chiếu'
    | 'Studio'
    | 'Năm phát hành'
    | 'Quốc gia';
  description: string;
}

export interface IOptionDropType {
  value: any;
  label: string;
  disabled?: boolean;
}

export interface INotice {
  id: string;
  senderId: string;
  receiverId: string;
  title: string;
  message: string;
  time: string; // ISO date string
  type: string;
  targetUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface IMovieItemField {
  label: string;
  value: string;
}

export interface IMovieItemSearch {
  imageUrl: string;
  title: string;
  fields: IMovieItemField[];
}

export interface IDataLoginUsername {
  username: string;
  password: string;
}

export interface IDataLoginEmail {
  email: string;
  password: string;
}

export interface IDataRegisterUser {
  username: string;
  email: string;
  password: string;
}

export interface IDataCreateEpisodePending {
  animeId: string;
  selectedFile: File | null;
  selectedDate: string;
  summary: string;
  episodeNumber: string;
}

//-------------- Data filter advance--------------------
export interface IMovieQuery {
  title?: string;
  partialTitle?: boolean;
  movieTypes?: string[];
  statusNames?: string[];
  releaseYearNames?: string[];
  studioNames?: string[];
  scheduleNames?: string[];
  genreNames?: string[];
  countryNames?: string[];
  minRating?: number;
  nominated?: boolean;
  newlyUpdated?: boolean;
  statusFilters?: string[];
  submittedByUsername?: string;
  reviewedByUsername?: string;
}

export interface IEpisodeQuery {
  animeId?: string;
  title?: string;
  partialTitle?: boolean;
  statusFilters?: ['rejected' | 'pending' | 'approved'];
  submittedByUsername?: string;
  reviewedByUsername?: string;
}

//--------------Input episode local---------------------
export interface IEpisodeLocal {
  episodeId: string;
  watchedDuration: number;
  watchedDate: string;
}

export interface ILocalData {
  localData: IEpisodeLocal[];
}

//--------------Input Anime local-----------------------
export interface ILocalWatchlistData {
  localWatchlistData: IAnimeInfoLocal[];
}

export interface IAnimeInfoLocal {
  animeId: string;
  dateAdded: string;
}

//--------------Schedule filter input-------------------
export interface IScheduleFilterData {
  startDate?: string;
  endDate?: string;
  statusDeadline?:
    | 'QUA_HAN_MOD'
    | 'ON_TIME'
    | 'QUA_HAN_ADMIN'
    | 'DONE_APPROVED_ON_TIME'
    | 'DONE_REJECTED_ON_TIME';
  submittedByModerator?: string;
  reviewedByAdmin?: string;
  animeStatus?: 'approved' | 'pending' | 'rejected';
  episodeStatus?: 'approved' | 'pending' | 'rejected';
}

//--------------Nạp GP---------------------------
export interface IDepositGPData {
  amount: number;
  currency: 'GP';
  transactionCode: string;
  counterpartBankCode: string;
}

export interface IProductItem {
  id: string;
  name: string;
  description: string;
  priceInGP: number;
  duration: number;
  createdAt: string;
  updatedAt: string;
}
