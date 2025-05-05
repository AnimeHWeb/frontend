import { Component, OnInit, ViewChild } from '@angular/core';
import { IThumbnailCard } from '../../models/InterfaceData';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { MoviesService } from '../../services/api-service/movies.service';
import { CommentFilmComponent } from '../../components/multi-structure/comment/comment-film.component';
import { CommonModule } from '@angular/common';
import { DropdownButtonComponent } from '../../components/regular/dropdown/dropdown.component';
import { InteractiveButtonComponent } from '../../components/regular/button/button.component';
import { VideoPlayerComponent } from '../../components/multi-structure/video-player/video-player.component';
import { API_CONFIG } from '../../services/config-service/config';
import {
  ICommentFilmResponse,
  IOneEpisode,
} from '../../models/InterfaceResponse';
import { EpisodeApprovalComponent } from '../../components/multi-structure/episode-approval/episode-approval.component';
import { CookieService } from 'ngx-cookie-service';
import { Store } from '@ngrx/store';
import { selectIsAuthenticated } from '../../store/auth/auth.selectors';
import { debounceTime, Observable, Subject, Subscription } from 'rxjs';
import { maptIAnimeResponseToIOptionSeason } from '../film-details/film-details.component';
import { IOptionSeason } from '../../components/multi-structure/movie-info/movie-info.component';
import { sendNotification } from '../../utils/notification';
import { LoadingOverlayComponent } from '../../components/regular/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-episode-view',
  imports: [
    CommentFilmComponent,
    CommonModule,
    DropdownButtonComponent,
    InteractiveButtonComponent,
    VideoPlayerComponent,
    EpisodeApprovalComponent,
    LoadingOverlayComponent,
  ],
  templateUrl: './episode-view.component.html',
  styleUrl: './episode-view.component.scss',
})
export class EpisodeViewComponent implements OnInit {
  @ViewChild(VideoPlayerComponent) videoPlayer!: VideoPlayerComponent;
  currentTimeSecond: number = 0;
  lastSavedTime: number = 0; // Biến để nhớ thời điểm đã lưu gần nhất
  role: string;
  token: string;
  isAuthen$: Observable<boolean>;
  episodes: IOneEpisode[] = [];
  video: IThumbnailCard | undefined;
  episode: IOneEpisode = {
    id: '',
    anime: {
      id: '',
      title: '',
      releaseYear: null,
      director: null,
      totalEpisodes: null,
      expectedEpisodes: null,
      posterUrl: null,
      bannerUrl: null,
      trailerUrl: '',
      averageRating: '',
      viewCount: null,
      seriesOrder: '',
      typeItems: [],
      series: {
        id: '',
        title: '',
        posterUrl: null,
        bannerUrl: null,
      },
    },
    episodeNumber: 0,
    title: null,
    description: '',
    videoUrl: '',
    subtitleUrl: null,
    duration: null,
    scheduledDate: '',
    publishedAt: null,
    historyDuration: null,
    status: null,
    rejectedReason: null,
    submittedBy: null,
    reviewedBy: null,
    submittedAt: null,
    reviewedAt: null,
    createdAt: null,
    updatedAt: null,
  };
  historyId: string = '';
  safeVideoUrl: SafeResourceUrl | null = null;
  commentsData: ICommentFilmResponse[] = [];
  videoUrl: string;
  videoFake: string = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
  loading = false;
  activeDropdown: string | null = null;
  isLightOff: boolean = false;
  durationWatched: number | undefined;

  selectedSeries = {
    value: 1,
    label: 'Phần 1',
  };
  series: IOptionSeason[] = [];

  private currentTimeSubject = new Subject<number>();
  // Thuộc tính lưu Subscription, nếu muốn hủy khi destroy
  private currentTimeSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private moviesService: MoviesService,
    private router: Router,
    private cookieService: CookieService,
    private store: Store
  ) {
    this.videoUrl = API_CONFIG.BASE_URLS.MAIN_API;
    this.role = this.cookieService.get('role');
    this.token = localStorage.getItem('token') ?? '';
    this.isAuthen$ = this.store.select(selectIsAuthenticated);
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.durationWatched = navigation.extras.state['durationWatched'];
      this.historyId = navigation.extras.state['historyId'];
      console.log(
        'Received durationWatched:',
        this.durationWatched,
        this.historyId
      );
    }
  }

  ngOnInit(): void {
    this.loading = true;
    this.route.paramMap.subscribe((params) => {
      const videoId = params.get('id');
      if (videoId) {
        this.moviesService.getEpisode(videoId).subscribe({
          next: (res) => {
            this.episode = res.result;
            this.loading = false;
            // Sau khi cập nhật episode, gọi API lấy danh sách tập của anime đó
            if (this.episode.status === 'approved') {
              this.currentTimeSubscription = this.currentTimeSubject
                .pipe(debounceTime(3000)) // 3 giây không cập nhật, mới gọi callback
                .subscribe((time) => {
                  // Gọi hàm addViewHistoryEpisode khi user ngừng xem 3 giây
                  this.addViewHistoryEpisode(this.episode.id, time);
                  console.log('đã lưu lịch sử');
                });
            }
            this.fetchAllEpisodesOfAnime(this.episode.anime.id);
            this.fetchSeries(this.episode.anime.series.id);
          },
          error: (err) => {
            console.error(err);
            this.loading = false;
          },
        });
      }
    });
  }

  ngOnDestroy() {
    // Gửi lịch sử xem tập này trước khi destroy:
    if (this.currentTimeSecond > 0 && this.episode.status === 'approved') {
      this.addViewHistoryEpisode(this.episode.id, this.currentTimeSecond);
    }

    // Hủy subscription
    if (this.currentTimeSubscription) {
      this.currentTimeSubscription.unsubscribe();
    }

    // Stop video
    if (this.videoPlayer) {
      this.videoPlayer.stopVideo();
    }
  }

  revertEpisode() {
    if (this.episode.id) {
      this.moviesService.revertEpisodeToPending(this.episode.id).subscribe({
        next: (res) => {
          sendNotification(
            this.store,
            'Đã ngừng phát hành',
            res.message,
            'success'
          );
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        },
        error: (err) => {
          sendNotification(this.store, 'Lỗi!', 'Có vấn đề xảy ra', 'error');
        },
      });
    }
  }

  //Lấy giá trị event cập nhật từ thẻ con lên
  onCurrentTimeUpdated(currentTime: number) {
    this.currentTimeSecond = currentTime;
    console.log('Thời gian hiện tại (giây):', this.currentTimeSecond);

    // Gửi giá trị qua Subject để kích hoạt debounce
    this.currentTimeSubject.next(this.currentTimeSecond);
  }

  addViewHistoryEpisode(epId: string, currentTime: number) {
    // Giả sử gọi API, v.v.
    if (this.isAuthen$ && this.token) {
      console.log('Đang gọi API addViewHistoryEpisode(...)');
      this.moviesService
        .addViewHistory(epId, currentTime)
        .subscribe((response) => {
          console.log(response.message);
        });
    } else {
      const localKey = 'viewHistory';
      let existingData = localStorage.getItem(localKey);
      const now = new Date();
      const localISOTime = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000
      )
        .toISOString()
        .substring(0, 19);

      // Tạo cấu trúc mặc định nếu local chưa có dữ liệu
      let storedObj = {
        localData: [] as Array<{
          episodeId: string;
          watchedDuration: number;
          watchedDate: string;
        }>,
      };

      // Nếu tồn tại, parse về object
      if (existingData) {
        storedObj = JSON.parse(existingData);
      }

      // Kiểm tra xem episodeId đã tồn tại trong localData chưa
      const existingIndex = storedObj.localData.findIndex(
        (item) => item.episodeId === epId
      );

      if (existingIndex !== -1) {
        // Nếu tồn tại, thay thế phần tử cũ
        storedObj.localData[existingIndex] = {
          episodeId: epId,
          watchedDuration: currentTime,
          watchedDate: localISOTime,
        };
      } else {
        // Nếu không tồn tại, thêm vào đầu mảng (theo kiểu stack)
        const newEntry = {
          episodeId: epId,
          watchedDuration: currentTime,
          watchedDate: localISOTime,
        };
        storedObj.localData.unshift(newEntry);
      }

      // Ghi đè lại vào localStorage
      localStorage.setItem(localKey, JSON.stringify(storedObj));
    }
  }

  fetchAllEpisodesOfAnime(animeId: string) {
    this.moviesService.getEpisodesOfAnime(animeId).subscribe({
      next: (res) => {
        this.episodes = res.result;
      },
    });
  }

  onClickOtherEpisode(id: string) {
    this.router.navigate(['/play', id]);
    if (this.currentTimeSecond > 0 && this.episode.status === 'approved') {
      this.addViewHistoryEpisode(this.episode.id, this.currentTimeSecond);
    }
  }

  handleSelect(select: any) {
    this.selectedSeries = select;

    this.router.navigate(['/film-details', this.selectedSeries.value]);
  }

  fetchSeries(seriesId: string) {
    this.moviesService.getAnimesInSeries(seriesId).subscribe({
      next: (response) => {
        this.series = response.result.map(maptIAnimeResponseToIOptionSeason);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  handleClickReport(event: any): void {
    console.log('Button clicked!', event);
  }

  handleTurnOffLight(event: any): void {
    // Toggle trạng thái tắt/bật đèn
    this.isLightOff = !this.isLightOff;
    console.log('Trạng thái tắt đèn:', this.isLightOff);
  }

  handleHover(isHovered: boolean): void {
    console.log('Button hover:', isHovered);
  }

  handleFocus(isFocused: boolean): void {
    console.log('Button focus:', isFocused);
  }
}
