import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IAnimeItemSavedResponse } from '../../models/InterfaceResponse';
import { ApiService } from '../../services/config-service/api.service';
import { Store } from '@ngrx/store';
import { selectIsAuthenticated } from '../../store/auth/auth.selectors';
import { MoviesService } from '../../services/api-service/movies.service';
import { PaginationComponent } from '../../components/regular/pagination/pagination.component';
import { CommonModule } from '@angular/common';
import { sizeImg } from '../../models/DataRoot';
import { API_CONFIG } from '../../services/config-service/config';
import { FormatViewPipe } from '../../pipes/format-view.pipe';
import { Router } from '@angular/router';
import { sendNotification } from '../../utils/notification';
import { ILocalWatchlistData } from '../../models/InterfaceData';
import { LoadingOverlayComponent } from '../../components/regular/loading-overlay/loading-overlay.component';
import { buildImageUrl } from '../../utils/stringProcess';

@Component({
  selector: 'app-watchlist',
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss'],
  imports: [
    PaginationComponent,
    CommonModule,
    FormatViewPipe,
    LoadingOverlayComponent,
  ],
})
export class WatchlistComponent implements OnInit {
  watchlistData: IAnimeItemSavedResponse[] = [];
  localWatchlistData: IAnimeItemSavedResponse[] = [];
  page: number = 1; // Trang hiện tại
  size: number = 5; // Số item mỗi trang
  totalItems: number = 0; // Tổng số item trả về từ server
  pageLocal: number = 1; // Trang hiện tại
  sizeLocal: number = 5; // Số item mỗi trang
  localData: string | null = null;
  totalItemsLocal: number = 0; // Tổng số item trả về từ server
  isAuth$: Observable<boolean>; // Giả sử bạn có observable kiểm tra xác thực người dùng
  token: string = '';
  notYetSync: string = '';
  isLoading = false;
  thumbnailDefault: string = 'assets/thumbnail-default.jpg';

  constructor(
    private movieService: MoviesService,
    private store: Store,
    private router: Router
  ) {
    this.isAuth$ = this.store.select(selectIsAuthenticated);
    this.token = localStorage.getItem('token') ?? '';
    this.notYetSync = localStorage.getItem('watchlist') ?? '';
  }

  ngOnInit(): void {
    const localDataString = localStorage.getItem('watchlist') ?? '';

    if (localDataString) {
      const localData = JSON.parse(localDataString) as ILocalWatchlistData;

      if (localData.localWatchlistData.length > 0) {
        this.loadLocalWatchlistData(localData);
      }
    }

    // Sau đó subscribe để kiểm tra isAuth có thật sự là true không
    this.isAuth$.subscribe((isAuthenticated) => {
      if (isAuthenticated && this.token) {
        // Nếu thật sự đăng nhập
        this.loadWatchlist(this.page, this.size);
      }
    });
  }

  buildImgThumbnailUrl(
    url: string | null,
    size: 'small' | 'tiny' | 'original'
  ): string {
    if (url) {
      return buildImageUrl(url, size);
    } else {
      return this.thumbnailDefault;
    }
  }

  loadWatchlist(page: number, size: number): void {
    this.isLoading = true;
    this.movieService.getWatchlist(page - 1, size).subscribe({
      next: (response) => {
        this.watchlistData = response.result.content;
        this.totalItems = response.result.totalElements;
        this.isLoading = false;
      },
      error: (err) => {
        console.log(err);
        this.isLoading = false;
      },
    });
  }

  loadLocalWatchlistData(localData: ILocalWatchlistData) {
    this.isLoading = true;
    this.movieService
      .getLocalWatchlist(localData, this.pageLocal - 1, this.sizeLocal)
      .subscribe({
        next: (res) => {
          this.localWatchlistData = res.result.content;
          this.totalItemsLocal = res.result.totalElements;
          this.isLoading = false;
        },
        error: (err) => {
          console.log(err);
          this.isLoading = false;
        },
      });
  }

  onPageChange(newPage: number): void {
    this.page = newPage;
    this.loadWatchlist(this.page, this.size);
  }

  onLocalPageChange(newPage: number): void {
    this.pageLocal = newPage;
    // Lấy lại dữ liệu từ localStorage mỗi khi người dùng thay đổi trang
    const localDataString = localStorage.getItem('watchlist');
    if (localDataString) {
      const localDataParsed = JSON.parse(
        localDataString
      ) as ILocalWatchlistData;
      this.loadLocalWatchlistData(localDataParsed);
    }
  }

  onClickMovie(movieId: string): void {
    this.router.navigate(['/film-details', movieId]);
  }

  removeItem(itemId: string): void {
    // Xử lý khi nhấn nút Remove
    console.log('Remove item with id: ', itemId);
    // Gọi API để xóa item nếu cần

    this.movieService.removeAnimeFromWatchlist(itemId).subscribe({
      next: (res) => {
        sendNotification(this.store, 'Đã gỡ!', res.message, 'success');
        this.loadWatchlist(this.page, this.size);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  removeItemLocal(itemId: string): void {
    // Đọc dữ liệu từ localStorage
    const localDataString = localStorage.getItem('watchlist');
    let localData: ILocalWatchlistData | null = null;

    if (localDataString) {
      localData = JSON.parse(localDataString) as ILocalWatchlistData;

      // Kiểm tra xem localData có tồn tại và có dữ liệu không
      if (localData?.localWatchlistData) {
        // Lọc bỏ phần tử có episodeId khớp với đối tượng cần xoá
        const updatedLocalData = localData.localWatchlistData.filter(
          (item) => item.animeId !== itemId
        );

        // Cập nhật lại mảng localData với dữ liệu đã xoá phần tử
        localData.localWatchlistData = updatedLocalData;

        // Ghi đè lại dữ liệu vào localStorage
        localStorage.setItem('watchlist', JSON.stringify(localData));

        this.loadLocalWatchlistData(localData);
        // Hiển thị thông báo và cập nhật giao diện
        sendNotification(
          this.store,
          'Đã gỡ phim!',
          'Phim đã được xoá khỏi watchlist thành công.',
          'success'
        );
      }
    }
  }
}
