import { Injectable } from '@angular/core';
import { ApiService } from '../config-service/api.service';
import { API_CONFIG } from '../config-service/config';
import {
  ICreateTagType,
  IEpisodeQuery,
  IListThumbnails,
  ILocalData,
  ILocalWatchlistData,
  IMovieItemSearch,
  IMovieQuery,
  IMovieUpdate,
  IScheduleFilterData,
  ITagFilm,
} from '../../models/InterfaceData';
import { SERVER_RESPONSE } from '../../models/ApiResponse';
import {
  IAnimeItemSavedResponse,
  IAnimeResponse,
  IAnimeSeriesResponse,
  ICreateAnimePendingResponse,
  ICreateTagTypeResponse,
  IListWatchingHistoryInfoResponse,
  IOneEpisode,
  IScheduleAnimeResponse,
  IScheduleEpisodeResponse,
  ITagFilmResponse,
  PageResponse,
} from '../../models/InterfaceResponse';
import { Observable } from 'rxjs';

function cleanObject(obj: Record<string, any>): Record<string, any> {
  return Object.entries(obj)
    .filter(([_, value]) => value != null && value !== '')
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
}

@Injectable({
  providedIn: 'root',
})
export class MoviesService {
  constructor(private api: ApiService) {}

  createSeries(title: string, description: string, banner: File, poster: File) {
    const body = { title, description };

    return this.api.uploadFile<SERVER_RESPONSE<null>>(
      API_CONFIG.ENDPOINTS.POST.POST_CREATE_SERIES,
      {
        bannerFile: banner,
        posterFile: poster,
      },
      body
    );
  }

  createAnimePending(
    seriesId: string | null,
    title: string,
    description: string | null,
    expectedEpisodes: number | null,
    linkTrailer: string | null,
    typeIds: string[] | null,
    scheduleDate: string | null,
    poster: File | null,
    banner: File | null
  ) {
    const body = cleanObject({
      seriesId,
      title,
      description,
      linkTrailer,
      expectedEpisodes,
      typeIds,
      scheduleDate,
    });

    const files = cleanObject({
      bannerFile: banner,
      posterFile: poster,
    });

    return this.api.uploadFile<SERVER_RESPONSE<ICreateAnimePendingResponse>>(
      API_CONFIG.ENDPOINTS.POST.POST_CREATE_ANIME_PENDING,
      files,
      body
    );
  }

  createEpisodePending(
    animeId: string,
    episodeNumber: string,
    description: string,
    videoFile: File,
    scheduledDate: string
  ) {
    const data = {
      animeId,
      episodeNumber,
      description,
      scheduledDate,
    };
    return this.api.uploadFile<SERVER_RESPONSE<IAnimeResponse>>(
      API_CONFIG.ENDPOINTS.POST.POST_CREATE_EPISODE_FILM,
      { videoFile: videoFile },
      data
    );
  }

  approveAnime(animeId: string) {
    return this.api.post<SERVER_RESPONSE<null>>(
      API_CONFIG.ENDPOINTS.POST.POST_APPROVED_ANIME(animeId),
      null
    );
  }

  rejectAnime(animeId: string, reason: string) {
    return this.api.post<SERVER_RESPONSE<null>>(
      API_CONFIG.ENDPOINTS.POST.POST_REJECT_ANIME(animeId),
      reason
    );
  }

  revertAnimeToPending(animeId: string) {
    return this.api.patch<SERVER_RESPONSE<null>>(
      API_CONFIG.ENDPOINTS.PATCH.PATCH_REVERT_ANIME_TO_PENDING(animeId),
      null
    );
  }

  revertEpisodeToPending(episodeId: string) {
    return this.api.patch<SERVER_RESPONSE<null>>(
      API_CONFIG.ENDPOINTS.PATCH.PATCH_REVERT_EPISODE_TO_PENDING(episodeId),
      null
    );
  }

  approveEpisode(episodeId: string) {
    return this.api.post<SERVER_RESPONSE<null>>(
      API_CONFIG.ENDPOINTS.POST.POST_APPROVE_EPISODE(episodeId),
      null
    );
  }

  rejectEpisode(episodeId: string, reason: string) {
    return this.api.post<SERVER_RESPONSE<null>>(
      API_CONFIG.ENDPOINTS.POST.POST_REJECT_EPISODE(episodeId),
      reason
    );
  }

  ratingAnime(animeId: string, rating: number) {
    return this.api.post<SERVER_RESPONSE<number>>(
      API_CONFIG.ENDPOINTS.POST.POST_RATING_ANIME(animeId, rating),
      null
    );
  }

  countView(animeId: string) {
    return this.api.post<SERVER_RESPONSE<null>>(
      API_CONFIG.ENDPOINTS.POST.POST_COUNT_VIEW(animeId),
      null
    );
  }

  updateEpisode(
    episodeId: string,
    title: string,
    description: string,
    videoFile?: File // Tham số videoFile là tùy chọn
  ): Observable<SERVER_RESPONSE<null>> {
    const data = { title, description };
    // Nếu có file thì tạo object chứa file với key 'video', nếu không có thì để undefined
    const files = videoFile ? { videoFile: videoFile } : undefined;

    // Luôn dùng phương thức patchWithFormData để gửi dữ liệu dạng form-data
    return this.api.patchWithFormData<SERVER_RESPONSE<null>>(
      API_CONFIG.ENDPOINTS.PATCH.PATCH_UPDATE_EPISODE(episodeId),
      data,
      files
    );
  }

  updateAnime(animeId: string, data: IMovieUpdate) {
    const dataSend: IMovieUpdate = Object.entries(data).reduce(
      (acc, [key, value]) => {
        // Nếu value là mảng rỗng, bỏ qua trường đó
        if (Array.isArray(value) && value.length === 0) {
          return acc;
        }
        if (value !== undefined && value !== null) {
          // Ép kiểu key thành keyof IMovieUpdate
          acc[key as keyof IMovieUpdate] = value;
        }
        return acc;
      },
      {} as IMovieUpdate
    );

    const files = {
      ...(data.posterFile ? { posterFile: data.posterFile } : {}),
      ...(data.bannerFile ? { bannerFile: data.bannerFile } : {}),
    };

    return this.api.patchWithFormData<SERVER_RESPONSE<null>>(
      API_CONFIG.ENDPOINTS.PATCH.PATCH_UPDATE_ANIME(animeId),
      dataSend,
      files
    );
  }

  deleteEpisode(episodeId: string) {
    return this.api.delete<SERVER_RESPONSE<null>>(
      API_CONFIG.ENDPOINTS.DELETE.DELETE_EPISODE(episodeId)
    );
  }

  getAllTypes() {
    return this.api.get<SERVER_RESPONSE<ITagFilmResponse[]>>(
      API_CONFIG.ENDPOINTS.GET.GET_ALL_TAGS
    );
  }

  getAllSeries() {
    return this.api.get<SERVER_RESPONSE<IAnimeSeriesResponse[]>>(
      API_CONFIG.ENDPOINTS.GET.GET_ALL_SERIES
    );
  }

  createType(dataCreate: ICreateTagType) {
    return this.api.post<SERVER_RESPONSE<ICreateTagTypeResponse>>(
      API_CONFIG.ENDPOINTS.POST.POST_CREATE_TAG_FILM,
      dataCreate
    );
  }

  getRandomAnime() {
    return this.api.get<SERVER_RESPONSE<IAnimeResponse>>(
      API_CONFIG.ENDPOINTS.GET.GET_RANDOM_ANIME
    );
  }

  getAllAnime(page: number, size: number) {
    return this.api.get<SERVER_RESPONSE<PageResponse<IAnimeResponse>>>(
      API_CONFIG.ENDPOINTS.GET.GET_ALL_ANIME(page, size)
    );
  }

  getAnimeById(id: string) {
    return this.api.get<SERVER_RESPONSE<IAnimeResponse>>(
      API_CONFIG.ENDPOINTS.GET.GET_ANIME_ID(id)
    );
  }

  getEpisodesOfAnime(animeId: string) {
    return this.api.get<SERVER_RESPONSE<IOneEpisode[]>>(
      API_CONFIG.ENDPOINTS.GET.GET_ALL_EPISODES_ANIME(animeId)
    );
  }

  getEpisode(id: string) {
    return this.api.get<SERVER_RESPONSE<IOneEpisode>>(
      API_CONFIG.ENDPOINTS.GET.GET_EPISODE_ID(id)
    );
  }

  filterAnimeAdvance(dataSearch: IMovieQuery, page: number, size: number) {
    return this.api.post<SERVER_RESPONSE<PageResponse<IAnimeResponse>>>(
      API_CONFIG.ENDPOINTS.POST.POST_FILTER_ANIME_ADVANCE(page, size),
      dataSearch
    );
  }

  filterEpisodeAdvanced(dataSearch: IEpisodeQuery, page: number, size: number) {
    return this.api.post<SERVER_RESPONSE<PageResponse<IOneEpisode>>>(
      API_CONFIG.ENDPOINTS.POST.POST_FILTER_EPISODE_ADVANCED(page, size),
      dataSearch
    );
  }

  filterAnimeSchedule(
    dataFilter: IScheduleFilterData,
    page: number,
    size: number
  ) {
    return this.api.post<SERVER_RESPONSE<PageResponse<IScheduleAnimeResponse>>>(
      API_CONFIG.ENDPOINTS.POST.POST_FILTER_ANIME_SCHEDULE(page, size),
      dataFilter
    );
  }

  filterEpisodeSchedule(
    dataFilter: IScheduleFilterData,
    page: number,
    size: number
  ) {
    return this.api.post<
      SERVER_RESPONSE<PageResponse<IScheduleEpisodeResponse>>
    >(
      API_CONFIG.ENDPOINTS.POST.POST_FILTER_EPISODE_SCHEDULE(page, size),
      dataFilter
    );
  }

  getTop4Animes() {
    return this.api.get<SERVER_RESPONSE<IAnimeResponse[]>>(
      API_CONFIG.ENDPOINTS.GET.GET_TOP4ANIMES
    );
  }

  getAnimesInSeries(seriesId: string) {
    return this.api.get<SERVER_RESPONSE<IAnimeResponse[]>>(
      API_CONFIG.ENDPOINTS.GET.GET_ANIMES_IN_SERIES(seriesId)
    );
  }

  getViewHistory(page: number, size: number) {
    return this.api.get<
      SERVER_RESPONSE<PageResponse<IListWatchingHistoryInfoResponse>>
    >(API_CONFIG.ENDPOINTS.GET.GET_VIEW_HISTORY(page, size));
  }

  getLocalViewHistory(localData: ILocalData, page: number, size: number) {
    return this.api.post<
      SERVER_RESPONSE<PageResponse<IListWatchingHistoryInfoResponse>>
    >(API_CONFIG.ENDPOINTS.POST.POST_LOCAL_VIEW_HISTORY(page, size), localData);
  }

  addViewHistory(episodeId: string, watchedDuration: number) {
    return this.api.post<SERVER_RESPONSE<null>>(
      API_CONFIG.ENDPOINTS.POST.POST_ADD_VIEW_HISTORY(
        episodeId,
        watchedDuration
      ),
      null
    );
  }

  syncLocalHistory(localData: ILocalData) {
    return this.api.post<SERVER_RESPONSE<null>>(
      API_CONFIG.ENDPOINTS.POST.POST_SYNC_LOCAL_HISTORY,
      localData
    );
  }

  deleteViewHistory(episodeId: string) {
    return this.api.post<SERVER_RESPONSE<null>>(
      API_CONFIG.ENDPOINTS.POST.POST_DELELTE_VIEW_HISTORY(episodeId),
      null
    );
  }

  getWatchlist(page: number, size: number) {
    return this.api.get<SERVER_RESPONSE<PageResponse<IAnimeItemSavedResponse>>>(
      API_CONFIG.ENDPOINTS.GET.GET_WATCHLIST(page, size)
    );
  }

  addAnimeToWatchlist(animeId: string) {
    return this.api.post<SERVER_RESPONSE<null>>(
      API_CONFIG.ENDPOINTS.POST.POST_ADD_ANIME_TO_WATCHLIST(animeId),
      null
    );
  }

  removeAnimeFromWatchlist(animeId: string) {
    return this.api.delete<SERVER_RESPONSE<null>>(
      API_CONFIG.ENDPOINTS.DELETE.DELETE_ANIME_FROM_WATCHLIST(animeId)
    );
  }

  syncLocalWatchlist(localData: ILocalWatchlistData) {
    return this.api.post<SERVER_RESPONSE<null>>(
      API_CONFIG.ENDPOINTS.POST.POST_SYNC_WATCHLIST,
      localData
    );
  }

  getLocalWatchlist(
    localData: ILocalWatchlistData,
    page: number,
    size: number
  ) {
    return this.api.post<
      SERVER_RESPONSE<PageResponse<IAnimeItemSavedResponse>>
    >(API_CONFIG.ENDPOINTS.POST.POST_WATCHLIST_LOCAL(page, size), localData);
  }

  // API Fake
  getTagFilm() {
    return this.api.get<SERVER_RESPONSE<ITagFilm[]>>(
      API_CONFIG.ENDPOINTS.GET.GET_TAGS,
      'SECONDARY_API'
    );
  }

  getCategoryList() {
    return this.api.get<SERVER_RESPONSE<IListThumbnails[]>>(
      API_CONFIG.ENDPOINTS.GET.VIDEO,
      'SECONDARY_API'
    );
  }

  postMovieItemSearch(searchText: string) {
    return this.api.get<SERVER_RESPONSE<IMovieItemSearch[]>>(
      API_CONFIG.ENDPOINTS.POST.POST_MOVIES_SEARCH,
      // { searchText },
      'SECONDARY_API'
    );
  }
}

/* Hướng dẫn sử dụng createSeries

uploadSeries(event: any) {
  const file = event.target.files[0];
  if (file) {
    const title = 'Series mới';
    const description = 'Đây là một series mới';

    this.moviesService.createSeries(file, title, description).subscribe({
      next: (res) => {
        console.log('Series đã được tạo:', res);
        alert('Tạo series thành công!');
      },
      error: (err) => {
        console.error('Lỗi khi tạo series:', err);
        alert('Tạo series thất bại!');
      },
    });
  }
}

*/
