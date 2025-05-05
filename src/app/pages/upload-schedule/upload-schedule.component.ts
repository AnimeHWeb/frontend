import { Component } from '@angular/core';
import { IListThumbnails } from '../../models/InterfaceData';
import { MoviesService } from '../../services/api-service/movies.service';
import { forkJoin } from 'rxjs';
import { IScheduleAnimeResponse } from '../../models/InterfaceResponse';
import {
  mapAnimeToThumbnail,
  mapScheduleEpisodeToScheduleAnime,
} from '../../utils/mapData';
import { VideoSectionComponent } from '../../components/multi-structure/video-section/video-section.component';
import { CommonModule } from '@angular/common';
import { getEndOfWeek, getStartOfWeek } from '../../utils/createDate';
import { LoadingOverlayComponent } from '../../components/regular/loading-overlay/loading-overlay.component';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-upload-schedule',
  imports: [VideoSectionComponent, CommonModule, LoadingOverlayComponent],
  templateUrl: './upload-schedule.component.html',
  styleUrl: './upload-schedule.component.scss',
})
export class UploadScheduleComponent {
  isLoading = false;
  videos: IListThumbnails[] = [];
  username: string = '';

  updateToDay: IScheduleAnimeResponse[] = [];
  updateDuringWeek: IScheduleAnimeResponse[] = [];
  outOfDate: IScheduleAnimeResponse[] = [];
  EpOutOfDate: IScheduleAnimeResponse[] = [];

  constructor(
    private moviesService: MoviesService,
    private cookiesService: CookieService
  ) {
    this.username = cookiesService.get('username');
  }

  ngOnInit(): void {
    this.isLoading = true;
    const formattedDate = new Date().toLocaleDateString('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
    });

    forkJoin({
      updateToDay: this.moviesService.filterAnimeSchedule(
        {
          startDate: formattedDate,
          endDate: formattedDate,
          submittedByModerator: this.username,
          animeStatus: 'pending',
        },
        0,
        9
      ),
      updateDuringWeek: this.moviesService.filterAnimeSchedule(
        {
          startDate: getStartOfWeek(),
          endDate: getEndOfWeek(),
          submittedByModerator: this.username,
          animeStatus: 'pending',
        },
        0,
        9
      ),
      outOfDate: this.moviesService.filterAnimeSchedule(
        {
          statusDeadline: 'QUA_HAN_ADMIN',
        },
        0,
        9
      ),
      EpOutOfDate: this.moviesService.filterEpisodeSchedule(
        {
          statusDeadline: 'QUA_HAN_ADMIN',
        },
        0,
        9
      ),
    }).subscribe({
      next: ({ EpOutOfDate, outOfDate, updateDuringWeek, updateToDay }) => {
        this.updateToDay = updateToDay.result.content;
        this.updateDuringWeek = updateDuringWeek.result.content;
        this.outOfDate = outOfDate.result.content;
        this.EpOutOfDate = EpOutOfDate.result.content.map((episode) =>
          mapScheduleEpisodeToScheduleAnime(episode)
        );

        const animeCategoryUpdateToDay: IListThumbnails = {
          category: 'Cần cập nhật trong ngày',
          useApi: 'FAS',
          query: {
            scheduleQueries: {
              startDate: formattedDate,
              endDate: formattedDate,
              submittedByModerator: this.username,
              animeStatus: 'pending',
            },
          },
          videos: this.updateToDay.map((animeSchedule) =>
            mapAnimeToThumbnail(animeSchedule.anime)
          ),
        };

        const animeCategoryUpdateDuringWeek: IListThumbnails = {
          category: 'Cần cập nhật trong tuần',
          useApi: 'FAS',
          query: {
            scheduleQueries: {
              startDate: getStartOfWeek(),
              endDate: getEndOfWeek(),
              animeStatus: 'pending',
            },
          },
          videos: this.updateDuringWeek.map((animeSchedule) =>
            mapAnimeToThumbnail(animeSchedule.anime)
          ),
        };

        const animeCategoryOutOfDate: IListThumbnails = {
          category: 'Anime trễ lịch duyệt',
          useApi: 'FAS',
          query: {
            scheduleQueries: {
              statusDeadline: 'QUA_HAN_ADMIN',
            },
          },
          videos: this.outOfDate.map((animeSchedule) =>
            mapAnimeToThumbnail(animeSchedule.anime)
          ),
        };

        const animeCategoryEpisodeOutOfDate: IListThumbnails = {
          category: 'Tập phim trễ lịch duyệt',
          useApi: 'FES',
          query: {
            scheduleQueries: {
              statusDeadline: 'QUA_HAN_ADMIN',
            },
          },
          videos: this.EpOutOfDate.map((animeSchedule) =>
            mapAnimeToThumbnail(animeSchedule.anime)
          ),
        };

        this.videos.push(animeCategoryUpdateToDay);
        this.videos.push(animeCategoryUpdateDuringWeek);
        this.videos.push(animeCategoryOutOfDate);
        this.videos.push(animeCategoryEpisodeOutOfDate);
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }
}
