import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IEpisodeQuery,
  IMovieQuery,
  IThumbnailCard,
} from '../../models/InterfaceData';
import { MoviesService } from '../../services/api-service/movies.service';
import { Router } from '@angular/router';
import { MovieCardComponent } from '../../components/multi-structure/movie-card/movie-card.component';
import { PaginationComponent } from '../../components/regular/pagination/pagination.component';
import { IAnimeResponse, IOneEpisode } from '../../models/InterfaceResponse';
import {
  mapAnimeToThumbnail,
  mapEpisodesToThumbnails,
} from '../../utils/mapData';
import { LoadingOverlayComponent } from '../../components/regular/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-movie-approval',
  imports: [
    CommonModule,
    MovieCardComponent,
    PaginationComponent,
    LoadingOverlayComponent,
  ],
  templateUrl: './movie-approval.component.html',
  styleUrl: './movie-approval.component.scss',
})
export class MovieApprovalComponent {
  videos: IThumbnailCard[] = [];
  currentPageIndex: number = 1;
  itemsPerPage: number = 8;
  totalData: number = 0;

  episodes: IThumbnailCard[] = [];
  currentPageEpisodeIndex: number = 1;
  itemsEpisodePerPage: number = 8;
  totalDataEpisode: number = 0;

  allAnime: IAnimeResponse[] = [];
  episodesResponse: IOneEpisode[] = [];
  dataQuery: IMovieQuery = { statusFilters: ['pending'] };
  dataQueryEpisode: IEpisodeQuery = { statusFilters: ['pending'] };

  // Biến dùng để điều khiển hiển thị loading
  isLoading = false;

  constructor(private moviesService: MoviesService, private router: Router) {}

  ngOnInit(): void {
    // Gọi hàm fetchData để lấy dữ liệu ban đầu (pageIndex=0, pageSize=18)
    this.fetchData(0, 18);
  }

  // Dùng chung để fetch data
  private fetchData(pageIndex: number, pageSize: number) {
    this.isLoading = true; // bật trạng thái loading

    const requestAnimePending = this.moviesService.filterAnimeAdvance(
      this.dataQuery,
      pageIndex,
      pageSize
    );

    const requestEpisodePending = this.moviesService.filterEpisodeAdvanced(
      this.dataQueryEpisode,
      pageIndex,
      pageSize
    );

    requestAnimePending.subscribe({
      next: (res) => {
        this.allAnime = res.result.content;

        this.currentPageIndex = res.result.pageable.pageNumber + 1;
        this.totalData = res.result.totalElements;
        this.itemsPerPage = res.result.pageable.pageSize;

        const mappedThumbnails: IThumbnailCard[] = this.allAnime.map((anime) =>
          mapAnimeToThumbnail(anime)
        );

        this.videos = mappedThumbnails;
        this.isLoading = false; // tắt loading khi thành công
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false; // tắt loading cả khi lỗi
      },
    });

    requestEpisodePending.subscribe({
      next: (res) => {
        this.episodesResponse = res.result.content;

        this.currentPageEpisodeIndex = res.result.pageable.pageNumber + 1;
        this.totalDataEpisode = res.result.totalElements;
        this.itemsEpisodePerPage = res.result.pageable.pageSize;

        const mappedThumbnails: IThumbnailCard[] = mapEpisodesToThumbnails(
          this.episodesResponse
        );

        this.episodes = mappedThumbnails;
        this.isLoading = false; // tắt loading khi thành công
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false; // tắt loading cả khi lỗi
      },
    });
  }

  toggleBackToHome() {
    this.router.navigate(['/']);
  }

  onPageChangeAnime(newPage: number) {
    this.currentPageIndex = newPage;
    const pageIndexForApi = newPage - 1;

    // Gọi lại hàm fetchData để lấy dữ liệu trang mới
    this.fetchData(pageIndexForApi, this.itemsPerPage);
  }
  onPageChangeEpisode(newPage: number) {
    this.currentPageEpisodeIndex = newPage;
    const pageIndexForApi = newPage - 1;

    // Gọi lại hàm fetchData để lấy dữ liệu trang mới
    this.fetchData(pageIndexForApi, this.itemsPerPage);
  }
}
