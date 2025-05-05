import { environment } from '../../../environments/environment';

export const API_CONFIG = {
  BASE_URLS: {
    MAIN_API: environment.IP_SERVER + '/animeh/api',
    SECONDARY_API: 'http://localhost:3000',
  },
  ENDPOINTS: {
    GET: {
      VIDEO: '/list_film',
      GET_NOTICES: '/notices',
      GET_TAGS: '/tags',
      GET_ALL_TAGS: '/animes-query/types',
      GET_ALL_SERIES: '/animes-query/series',
      GET_TOP4ANIMES: '/animes-query/top4',
      GET_RANDOM_ANIME: '/animes-query/random',
      GET_ANIMES_IN_SERIES: (seriesId: string) =>
        `/animes-query/series/${seriesId}/animes`,
      GET_MODERATOR_PROFILE: '/moderator-register/profile',
      GET_ACCOUNT_AVATAR: (type: 'small' | 'tiny' | 'original') =>
        `/user/avatar?size=${type}`,
      GET_ACCOUNT_BACKGROUND: (type: 'small' | 'tiny' | 'original') =>
        `/user/background?size=${type}`,
      GET_ALL_ANIME: (page: number, size: number) =>
        `/animes-query/animes?page=${page}&size=${size}`,
      GET_ANIME_ID: (animeId: string) => `/animes-query/anime/${animeId}`,
      GET_ALL_EPISODES_ANIME: (animeId: string) =>
        `/animes-query/anime/${animeId}/episodes`,
      GET_EPISODE_ID: (episodeId: string) =>
        `/animes-query/episode/${episodeId}`,
      GET_INFO_ACCOUNT: '/user/profile',
      GET_CHECK_TOKEN: '/check-token',
      GET_ALL_USER: (page: number, size: number) =>
        `/admin/users?page=${page}&size=${size}`,
      GET_USER_BY_ID: (userId: string) => `/admin/user/${userId}`,
      GET_MODERATOR_REQUEST_BY_USER_ID: (userId: string) =>
        `/moderator-register/admin/request/by-user/${userId}`,
      GET_VIEW_HISTORY: (page: number, size: number) =>
        `/history?page=${page}&size=${size}`,
      GET_WATCHLIST: (page: number, size: number) =>
        `/watchlist?page=${page}&size=${size}`,
      GET_ALL_ROOT_COMMENTS: (animeId: string, page: number, size: number) =>
        `/comments/all-root?animeId=${animeId}&page=${page}&size=${size}`,
      GET_ACTIVE_ROOT_COMMENTS: (animeId: string, page: number, size: number) =>
        `/public/comments/active-root?animeId=${animeId}&page=${page}&size=${size}`,
      GET_STATISTIC_ANIMES: '/admin/statistic/animes',
      GET_CURRENTGP: '/gp/me',
      GET_ALL_PRODUCTS: (page: number, size: number) =>
        `/public/products?page=${page}&size=${size}`,
      GET_PURCHASE_HISTORY: (page: number, size: number) =>
        `/payment/history?page=${page}&size=${size}`,
      GET_CURRENT_NOTIFICATIONS: (page: number, size: number) =>
        `/notifications?page=${page}&size=${size}`,
      GET_NUMBER_OF_UNREAD_NOTIFICATIONS: '/notification/not-read/count',
    },
    POST: {
      POST_MOVIES_SEARCH: '/movie_search',
      POST_LOGIN_USERNAME: '/auth/login-username',
      POST_LOGIN_EMAIL: '/auth/login-email',
      POST_REGISTER: '/auth/register',
      POST_GUEST_REQ_MODERATOR: '/moderator-register/guest',
      POST_USER_REQ_MODERATOR: '/moderator-register/user',
      POST_UPLOAD_BACKGROUND: '/user/upload/background',
      POST_UPLOAD_AVATAR: '/user/upload/avatar',
      POST_LOGOUT: '/user-logout',
      POST_REFESH_TOKEN: '/refresh-token',
      POST_CREATE_SERIES: '/moderator-film/series',
      POST_CREATE_ANIME_PENDING: '/moderator-film/anime',
      POST_CREATE_TAG_FILM: '/admin/type',
      POST_CREATE_EPISODE_FILM: '/moderator-film/episode',
      POST_FORGOT_PASSWORD: '/auth/forgot-password',
      POST_RESET_PASSWORD: '/auth/reset-password',
      POST_FILTER_ANIME_ADVANCE: (page: number, size: number) =>
        `/animes-query/filter-advanced?page=${page}&size=${size}`,
      POST_FILTER_ANIME_SCHEDULE: (page: number, size: number) =>
        `/schedules/filter?page=${page}&size=${size}`,
      POST_FILTER_EPISODE_ADVANCED: (page: number, size: number) =>
        `/animes-query/episodes/filter-advanced?page=${page}&size=${size}`,
      POST_FILTER_EPISODE_SCHEDULE: (page: number, size: number) =>
        `/schedule-episodes/filter?page=${page}&size=${size}`,
      POST_APPROVED_ANIME: (animeId: string) =>
        `/admin-film/approve-anime/${animeId}`,
      POST_REJECT_ANIME: (animeId: string) =>
        `/admin-film/reject-anime/${animeId}`,
      POST_APPROVE_EPISODE: (episodeId: string) =>
        `/admin-film/approve-episode/${episodeId}`,
      POST_REJECT_EPISODE: (episodeId: string) =>
        `/admin-film/reject-episode/${episodeId}`,
      POST_APPROVE_MODERATOR: (requestId: string) =>
        `/moderator-register/admin/approve/${requestId}`,
      POST_REJECT_MODERATOR: (requestId: string) =>
        `/moderator-register/admin/rejected/${requestId}`,
      POST_ADD_VIEW_HISTORY: (episodeId: string, watchedDuration: number) =>
        `/history/add?episodeId=${episodeId}&watchedDuration=${watchedDuration}`,
      POST_SYNC_LOCAL_HISTORY: '/history/sync',
      POST_DELELTE_VIEW_HISTORY: (episodeId: string) =>
        `/history/delete?episodeId=${episodeId}`,
      POST_LOCAL_VIEW_HISTORY: (page: number, size: number) =>
        `/public/history?page=${page}&size=${size}`,
      POST_ADD_ANIME_TO_WATCHLIST: (animeId: string) =>
        `/watchlist/add?animeId=${animeId}`,
      POST_SYNC_WATCHLIST: '/watchlist/sync',
      POST_WATCHLIST_LOCAL: (page: number, size: number) =>
        `/public/watchlist?page=${page}&size=${size}`,
      POST_CREATE_NEW_COMMENT: '/comments/create',
      POST_REPLY_COMMENT: '/comments/reply',
      POST_RATING_ANIME: (animeId: string, value: number) =>
        `/rating/anime/${animeId}?value=${value}`,
      POST_COUNT_VIEW: (animeId: string) =>
        `/public/anime-view/${animeId}/count`,
      POST_DEPOSIT_GP: '/gp/deposit',
      POST_PURCHASE_PRODUCT: '/gp/purchase',
      POST_MARK_AS_READ_NOTIFICATIONS: '/notifications/read',
    },
    PATCH: {
      PATCH_UPDATE_INFO_ACCOUNT: '/user',
      PATCH_UPDATE_PASSWORD: '/user/password',
      PATCH_LOCK_ACCOUNT: (userId: string) => `/admin/user/${userId}`,
      PATCH_UPDATE_EPISODE: (episodeId: string) =>
        `/moderator-film/episode/${episodeId}`,
      PATCH_UPDATE_ANIME: (animeId: string) =>
        `/moderator-film/anime/${animeId}`,
      PATCH_REVERT_ANIME_TO_PENDING: (animeId: string) =>
        `/moderator-film/anime/${animeId}/revert-pending`,
      PATCH_REVERT_EPISODE_TO_PENDING: (episodeId: string) =>
        `/moderator-film/episode/${episodeId}/revert-pending`,
    },
    DELETE: {
      DELETE_ANIME_FROM_WATCHLIST: (animeId: string) =>
        `/watchlist/remove?animeId=${animeId}`,
      DELETE_EPISODE: (episodeId: string) =>
        `/moderator-film/episode/${episodeId}`,
    },
  },
  HEADERS: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  },
};
