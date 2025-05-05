//--------------------Tạo tag phim---------------------
export interface ITagFilmResponse {
  id: string;
  name: string;
  description: string;
  type: string;
  createdAt: string; // ISO Date format
}

export interface ICreateTagTypeResponse {
  id: string;
  name: string;
  description: string;
  type: string;
  createAt: string; //ISO Date
}

//-----------Tạo anime và series--------------------------
export interface IAnimeSeriesResponse {
  id: string;
  title: string;
  description: string;
  posterUrl: string | null;
  bannerUrl: string | null;
  createdAt: string; // ISO Date format
  animes: string[]; // Danh sách anime trong series
}

export interface ICreateAnimePendingResponse {
  id: string;
  title: string;
  description: string;
  releaseYear: number;
  trailerUrl: string;
  statusSubmitted: string; // Có thể thay bằng enum nếu có nhiều trạng thái cố định
  submittedBy: string;
  submittedAt: string;
  averageRating: number;
  series: IAnimeSeries;
  seriesOrder: string;
  createdAt: string;
}

export interface IAnimeSeries {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

//---------------------Auth Response------------------------
export interface ILoginResponse {
  username: string;
  email: string;
  role: string;
  avatarUrl: string;
  accessToken: string;
  tokenAccessType: string;
  tokenId: string;
  refreshValue: string;
  expiryTime: string; // Hoặc Date nếu bạn muốn dùng kiểu Date
  isAuthenticated: boolean;
}

export interface IFullInfoAccountRessponse {
  username: string;
  email: string | null;
  role: string;
  avatarUrl: string;
  backgroundUrl: string;
  displayName: string | null;
  fullName: string | null;
  gender: boolean | null;
  bio: string | null;
  cccd: string | null;
  phoneNumber: string | null;
  isActive: boolean;
  lastLogin: string; // ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
  gpValue: number; // BigDecimal tương đương với number trong TS
  createdAt: string; // ISO 8601 format
  updatedAt: string; // ISO 8601 format
  moderatorRequestStatus: 'rejected' | 'pending' | 'approved' | null;
}

export interface IModeratorRequestResponse {
  id: string;
  user_username: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface ILogoutResponse {
  selectIsAuthenticated: boolean;
}

export interface IAccountUserResponse {
  id: string;
  username: string;
  password: string;
  email: string;
  role: string;
  displayName: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  backgroundUrl: string | null;
  gender: boolean | null;
  bio: string | null;
  cccd: string | null;
  phoneNumber: string | null;
  isActive: boolean;
  lastLogin: string | null;
  gpValue: any; // Nếu biết rõ kiểu dữ liệu, có thể thay `any` bằng kiểu tương ứng
  createdAt: string;
  updatedAt: string | null;
  moderatorRequestStatus: 'reject' | 'pending' | 'approved';
}

//-------------Dành cho response Get 1 Anime--------------
export interface IScheduleAnimeResponse {
  id: string;
  anime: IAnimeResponse;
  scheduleDate: string;
  modDeadline: string;
  statusDeadline:
    | 'QUA_HAN_MOD'
    | 'ON_TIME'
    | 'QUA_HAN_ADMIN'
    | 'DONE_APPROVED_ON_TIME'
    | 'DONE_REJECTED_ON_TIME';
  createdAt: string;
  updatedAt: string;
}

export interface IAnimeResponse {
  id: string;
  title: string;
  description: string;
  releaseYear: number;
  director: string;
  expectedEpisodes: number;
  posterUrl: string;
  bannerUrl: string;
  trailerUrl: string;
  ratingCount: number;
  followCount: number;
  averageRating: number; // BigDecimal -> number
  viewCount: number; // Long -> number
  seriesOrder: string;
  totalEpisodeCount: number;
  episodes: IEpisodeInAnimeResponse[];
  typeItems: ITypeItemResponse[];
  series: IAnimeSeriesInAnimeResponse;
  // Thông tin duyệt (ẩn với user)
  inWatchlist: boolean;
  publishingSchedule: {
    id: string;
    scheduleDate: string;
    modDeadline: string;
    statusDeadline:
      | 'QUA_HAN_MOD'
      | 'ON_TIME'
      | 'QUA_HAN_ADMIN'
      | 'DONE_APPROVED_ON_TIME'
      | 'DONE_REJECTED_ON_TIME';
    createdAt: string;
    updatedAt: string;
  } | null;
  statusSubmitted: string;
  rejectedReason: string;
  submittedBy: string;
  reviewedBy: string;
  submittedAt: string; // LocalDateTime -> string (ISO)
  reviewedAt: string; // LocalDateTime -> string (ISO)
  // Thông tin cho Moderator/Admin
  createdAt: string; // LocalDateTime -> string (ISO)
  updatedAt: string; // LocalDateTime -> string (ISO)
}

export interface IAnimeSeriesInAnimeResponse {
  id: string;
  title: string;
  posterUrl: string;
  bannerUrl: string;
}

export interface ITypeItemResponse {
  id: string;
  name: string;
  type: string;
}

export interface IEpisodeInAnimeResponse {
  id: string;
  episodeNumber: number;
  title: string | null;
  videoUrl: string;
  subtitleUrl: string | null;
  duration: number | null; // BigDecimal -> number
  scheduledDate: string; // LocalDateTime -> string (ISO)
  publishedAt: string | null; // LocalDateTime -> string (ISO)
  status?: string;
  rejectedReason?: string | null;
  submittedBy?: string;
  reviewedBy?: string | null;
  submittedAt?: string;
  reviewedAt?: string | null;
}

//-------------Phân trang----------------
export interface PageResponse<T> {
  content: T[];
  pageable: IPageable;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: ISort;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface IPageable {
  pageNumber: number;
  pageSize: number;
  sort: ISort;
  offset: number;
  paged: boolean;
  unpaged: boolean;
}

export interface ISort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

//--------------EpisodeResponse--------------

export interface IScheduleEpisodeResponse {
  id: string;
  episode: IOneEpisode;
  scheduleDate: string;
  modDeadline: string;
  statusDeadline:
    | 'QUA_HAN_MOD'
    | 'ON_TIME'
    | 'QUA_HAN_ADMIN'
    | 'DONE_APPROVED_ON_TIME'
    | 'DONE_REJECTED_ON_TIME';
  createdAt: string;
  updatedAt: string;
}

export interface IOneEpisode {
  id: string;
  anime: IAnime;
  episodeNumber: number;
  title: string | null;
  description: string;
  videoUrl: string;
  subtitleUrl: string | null;
  duration: number | null;
  scheduledDate: string;
  publishedAt: string | null;
  historyDuration: string | null;
  status: string | null;
  rejectedReason: string | null;
  submittedBy: string | null;
  reviewedBy: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface IAnime {
  id: string;
  title: string;
  releaseYear: number | null;
  director: string | null;
  totalEpisodes: number | null;
  expectedEpisodes: number | null;
  posterUrl: string | null;
  bannerUrl: string | null;
  trailerUrl: string;
  averageRating: string;
  viewCount: number | null;
  seriesOrder: string;
  typeItems: ITypeItemResponse[];
  series: ISeries;
}

export interface ISeries {
  id: string;
  title: string;
  posterUrl: string | null;
  bannerUrl: string | null;
}

//--------------View History Response-----------
export interface IAnimeHistory {
  id: string;
  title: string;
  description: string;
  totalEpisodes: number | null;
  viewCount: number;
  averageRating: number;
  posterUrl: string | null;
  bannerUrl: string | null;
}

export interface IEpisode {
  id: string;
  episodeNumber: number;
  videoUrl: string;
  duration: number | null;
  anime: IAnimeHistory;
}

export interface IListWatchingHistoryInfoResponse {
  id: string;
  watchedDate: string; // Có thể thay thành kiểu Date nếu bạn parse string sang Date
  watchedDuration: number;
  episode: IEpisode;
}

//----------Watchlist Response-----------------
export interface IAnimeInWatchlist {
  id: string;
  title: string;
  description: string;
  totalEpisodes: number | null;
  viewCount: number | null;
  averageRating: number;
  posterUrl: string;
  bannerUrl: string;
}

export interface IAnimeItemSavedResponse {
  id: string;
  dateAdded: string;
  anime: IAnimeInWatchlist;
}

//------------- Request Moderator---------------
export interface IRequestModeratorByUserId {
  id: string;
  userId: string;
  userUsername: string;
  adminId: string | null;
  adminUsername: string | null;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  commentRejected: string | null;
  processedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
}

//-------------comment response-----------
export interface ICommentFilmResponse {
  id: string;
  parentId: string | null;
  content: string;
  isDeactivated: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    username: string;
    email?: string;
    role?: string;
    avatarUrl: string;
    backgroundUrl?: string;
  };
  replies?: ICommentFilmResponse[];
}

//--------------Thống kê Anime------------
export interface IAnimeStatisticResponse {
  totalAnime: number;
  tvSeries: number;
  movie: number;
  finishedMovie: number;
  unfinishedMovie: number;
  unapprovedMovie: number;
}

//---------------Thanh toán và dịch vụ------------
export interface ITransaction {
  'Mã GD': number;
  'Mô tả': string;
  'Giá trị': number;
  'Ngày diễn ra': string;
  'Số tài khoản': string;
  'Mã tham chiếu': string;
}

export interface ITransactionStatus {
  data: ITransaction[];
  error: boolean;
}

export interface ITransactionDepositResponse {
  id: string;
  userPurchaseId: string | null;
  transactionType: string;
  amount: number;
  currency: string;
  transactionDate: string; // ISO date string
  status: string;
  description: string;
  transactionCode: string;
  accountNumber: string;
  counterpartBankCode: string;
  createdAt: string; // ISO date string
  updatedAt: string | null;
}

export interface IHistoryPurchaseResponse {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  purchaseDate: string; // ISO date string
  endDate: string; // ISO date string
  quantity: number;
  isActive: boolean;
  createdAt: string; // ISO date string
  updatedAt: string | null;
}
