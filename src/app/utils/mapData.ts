import { IThumbnailCard } from '../models/InterfaceData';
import {
  IAnime,
  IAnimeResponse,
  IOneEpisode,
  IScheduleAnimeResponse,
  IScheduleEpisodeResponse,
} from '../models/InterfaceResponse';

export function mapAnimeToThumbnail(anime: IAnimeResponse): IThumbnailCard {
  return {
    id: String(anime.id) || '0', // Nếu anime.id là chuỗi
    title: anime.title,
    videoUrl: anime.trailerUrl || '',
    thumbnail: anime.posterUrl,
    description: anime.description,
    duration: '', // Tự tính nếu cần
    ep: anime.totalEpisodeCount
      ? anime.totalEpisodeCount
      : anime.episodes.length, // Số tập
    total_ep: anime.expectedEpisodes,
    rating: anime.averageRating || 0,
    view: anime.viewCount || 0,
  };
}

export function mapEpisodesToThumbnails(
  episodes: IOneEpisode[]
): IThumbnailCard[] {
  return episodes.map((episode) => ({
    id: episode.anime.id, // Sử dụng id của episode
    title:
      episode.title || `${episode.anime.title} - Tập ${episode.episodeNumber}`,
    videoUrl: episode.videoUrl,
    thumbnail: episode.anime.posterUrl || '',
    description: episode.description,
    duration: episode.duration !== null ? String(episode.duration) : '', // Chuyển số duration thành chuỗi nếu có
    ep: episode.episodeNumber, // Số tập hiện tại của episode
    total_ep:
      episode.anime.expectedEpisodes || episode.anime.totalEpisodes || 0, // Tổng số tập dự kiến hoặc đã có
    rating: Number(episode.anime.averageRating) || 0,
    view: episode.anime.viewCount || 0,
  }));
}

// Hàm chuyển đổi từ IAnime sang IAnimeResponse
export function mapAnimeToAnimeResponse(anime: IAnime): IAnimeResponse {
  return {
    id: anime.id,
    title: anime.title,
    description: '', // Không có trong IAnime, gán mặc định
    releaseYear: anime.releaseYear || 0,
    director: anime.director || '',
    expectedEpisodes: anime.expectedEpisodes || 0,
    posterUrl: anime.posterUrl || '',
    bannerUrl: anime.bannerUrl || '',
    trailerUrl: anime.trailerUrl,
    ratingCount: 0, // Không có dữ liệu từ IAnime
    followCount: 0, // Không có dữ liệu từ IAnime
    averageRating: parseFloat(anime.averageRating) || 0, // Chuyển từ string sang number
    viewCount: anime.viewCount || 0,
    seriesOrder: anime.seriesOrder,
    totalEpisodeCount: anime.totalEpisodes || 0,
    episodes: [], // Không có thông tin episodes, gán mảng rỗng
    typeItems: anime.typeItems,
    series: {
      id: anime.series.id,
      title: anime.series.title,
      posterUrl: anime.series.posterUrl ?? '',
      bannerUrl: anime.series.bannerUrl ?? '',
    },
    inWatchlist: false, // Giá trị mặc định
    publishingSchedule: null, // Không có dữ liệu, gán null
    statusSubmitted: '',
    rejectedReason: '',
    submittedBy: '',
    reviewedBy: '',
    submittedAt: '',
    reviewedAt: '',
    createdAt: '', // Không có dữ liệu từ IAnime
    updatedAt: '', // Không có dữ liệu từ IAnime
  };
}

// Hàm chuyển đổi từ IScheduleEpisodeResponse sang IScheduleAnimeResponse
export function mapScheduleEpisodeToScheduleAnime(
  scheduleEpisode: IScheduleEpisodeResponse
): IScheduleAnimeResponse {
  return {
    id: scheduleEpisode.id,
    anime: mapAnimeToAnimeResponse(scheduleEpisode.episode.anime),
    scheduleDate: scheduleEpisode.scheduleDate,
    modDeadline: scheduleEpisode.modDeadline,
    statusDeadline: scheduleEpisode.statusDeadline,
    createdAt: scheduleEpisode.createdAt,
    updatedAt: scheduleEpisode.updatedAt,
  };
}

export function buildBannerUrl(
  bannerUrl: string | null,
  ipServer: string,
  size: 'tiny' | 'small' | 'original'
): string {
  const sizeImg = size + '.jpg';

  return bannerUrl
    ? `${ipServer}${bannerUrl}${sizeImg}`
    : 'assets/placeholder-banner.png';
}
