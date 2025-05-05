import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IMovieQuery,
  IQueries,
  IThumbnailCard,
} from '../../models/InterfaceData';
import { MoviesService } from '../../services/api-service/movies.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieCardComponent } from '../../components/multi-structure/movie-card/movie-card.component';
import { PaginationComponent } from '../../components/regular/pagination/pagination.component';
import { IAnimeResponse } from '../../models/InterfaceResponse';
import {
  mapAnimeToAnimeResponse,
  mapAnimeToThumbnail,
} from '../../utils/mapData';
import { LoadingOverlayComponent } from '../../components/regular/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-recommend-list-film',
  standalone: true,
  imports: [
    CommonModule,
    MovieCardComponent,
    PaginationComponent,
    LoadingOverlayComponent,
  ],
  templateUrl: './recommend-list-film.component.html',
  styleUrls: ['./recommend-list-film.component.scss'],
})
export class RecommendListFilmComponent {
  categoryName: string = '';
  videos: IThumbnailCard[] = [];
  currentPageIndex: number = 1;
  itemsPerPage: number = 8;
  totalData: number = 0;

  allAnime: IAnimeResponse[] = [];
  dataQuery: IQueries = {};
  useApi: string = '';

  // Biến dùng để điều khiển hiển thị loading
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private moviesService: MoviesService,
    private router: Router
  ) {
    // Lấy dataQuery nếu có (truyền qua navigation.extras.state)
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state && navigation.extras.state['dataQuery']) {
      this.dataQuery = navigation.extras.state['dataQuery'];
      this.useApi = navigation.extras.state['useApi'];
      console.log('Received dataQuery:', this.dataQuery);

      // Lưu dataQuery và useApi vào session storage
      sessionStorage.setItem('dataQuery', JSON.stringify(this.dataQuery));
      sessionStorage.setItem('useApi', this.useApi);
    } else {
      // Nếu không có dữ liệu từ navigation, lấy từ session storage
      const storedDataQuery = sessionStorage.getItem('dataQuery');
      const storedUseApi = sessionStorage.getItem('useApi');
      if (storedDataQuery) {
        this.dataQuery = JSON.parse(storedDataQuery);
      }
      if (storedUseApi) {
        this.useApi = storedUseApi;
      }
    }
  }

  ngOnInit(): void {
    // Lấy tên category từ param (nếu có)
    this.route.paramMap.subscribe((params) => {
      this.categoryName = params.get('categoryName') || '';
    });

    // Gọi hàm fetchData để lấy dữ liệu ban đầu (pageIndex=0, pageSize=18)
    this.fetchData(0, 18);
  }

  // Dùng chung để fetch data
  private fetchData(pageIndex: number, pageSize: number) {
    this.isLoading = true; // bật trạng thái loading

    let request$: any;

    if (this.useApi === 'FAA' && this.dataQuery.movieQueries) {
      request$ = this.moviesService.filterAnimeAdvance(
        this.dataQuery.movieQueries,
        pageIndex,
        pageSize
      );
    } else if (this.useApi === 'FEA' && this.dataQuery.episodeQueries) {
      request$ = this.moviesService.filterEpisodeAdvanced(
        this.dataQuery.episodeQueries,
        pageIndex,
        pageSize
      );
    } else if (this.useApi === 'FAS' && this.dataQuery.scheduleQueries) {
      request$ = this.moviesService.filterAnimeSchedule(
        this.dataQuery.scheduleQueries,
        pageIndex,
        pageSize
      );
    } else if (this.useApi === 'FES' && this.dataQuery.scheduleQueries) {
      request$ = this.moviesService.filterEpisodeSchedule(
        this.dataQuery.scheduleQueries,
        pageIndex,
        pageSize
      );
    }

    if (!request$) {
      console.error(
        'Không có request$ phù hợp! useApi =',
        this.useApi,
        'dataQuery =',
        this.dataQuery
      );
      this.isLoading = false;
      return; // hoặc hiển thị thông báo, v.v.
    }

    //TODO: Chỗ này chưa cứng, dễ lỗi, chưa test
    request$.subscribe({
      next: (res: {
        result: {
          content: any[]; // Dùng any[] để xử lý được cả 2 kiểu response
          pageable: { pageNumber: number; pageSize: number };
          totalElements: number;
        };
      }) => {
        let content: IAnimeResponse[] = [];
        if (this.useApi === 'FAS') {
          // Với API filterAnimeSchedule, lấy thuộc tính .anime
          content = res.result.content.map((item) => item.anime);
        } else if (this.useApi === 'FES') {
          // Với API filterEpisodeSchedule, lấy thuộc tính .episode
          content = res.result.content.map((item) =>
            mapAnimeToAnimeResponse(item.episode.anime)
          );
        } else if (this.useApi === 'FEA') {
          // Các API còn lại có cấu trúc giống nhau
          content = res.result.content.map((item) => item.episode.anime);
        } else {
          // Các API còn lại có cấu trúc giống nhau
          content = res.result.content;
        }

        this.allAnime = content;
        this.currentPageIndex = res.result.pageable.pageNumber + 1;
        this.totalData = res.result.totalElements;
        this.itemsPerPage = res.result.pageable.pageSize;

        const mappedThumbnails: IThumbnailCard[] = content.map((anime) =>
          mapAnimeToThumbnail(anime)
        );
        this.videos = mappedThumbnails;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  toggleBackToHome() {
    this.router.navigate(['/']);
  }

  onPageChange(newPage: number) {
    this.currentPageIndex = newPage;
    const pageIndexForApi = newPage - 1;

    // Gọi lại hàm fetchData để lấy dữ liệu trang mới
    this.fetchData(pageIndexForApi, this.itemsPerPage);
  }
}
