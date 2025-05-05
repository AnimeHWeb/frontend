import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../../components/regular/pagination/pagination.component';
import { IListWatchingHistoryInfoResponse } from '../../models/InterfaceResponse';
import { MoviesService } from '../../services/api-service/movies.service';
import { API_CONFIG } from '../../services/config-service/config';
import { sizeImg } from '../../models/DataRoot';
import { DurationFormatPipe } from '../../pipes/duration-format.pipe';
import { sendNotification } from '../../utils/notification';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { selectIsAuthenticated } from '../../store/auth/auth.selectors';
import { ILocalData } from '../../models/InterfaceData';
import { LoadingOverlayComponent } from '../../components/regular/loading-overlay/loading-overlay.component';
import { buildImageUrl } from '../../utils/stringProcess';

@Component({
  selector: 'app-view-history',
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent,
    DurationFormatPipe,
    LoadingOverlayComponent,
  ], // Thêm PaginationComponent vào imports
  templateUrl: './view-history.component.html',
  styleUrls: ['./view-history.component.scss'],
})
export class ViewHistoryComponent implements OnInit {
  historyData: IListWatchingHistoryInfoResponse[] = [];
  localHistoryData: IListWatchingHistoryInfoResponse[] = [];
  page: number = 1; // Trang hiện tại
  size: number = 5; // Số item mỗi trang
  totalItems: number = 0; // Tổng số item trả về từ server
  pageLocal: number = 1; // Trang hiện tại
  sizeLocal: number = 5; // Số item mỗi trang
  localData: string | null = null;
  totalItemsLocal: number = 0; // Tổng số item trả về từ server
  isAuth$: Observable<boolean>;
  token: string = '';
  notYetSync: string;
  isLoading = false;
  thumbnailDefault: string = 'assets/thumbnail-default.jpg';

  constructor(
    private movieService: MoviesService,
    private store: Store,
    private router: Router
  ) {
    this.isAuth$ = this.store.select(selectIsAuthenticated);
    this.notYetSync = localStorage.getItem('viewHistory') ?? '';
  }

  ngOnInit(): void {
    this.token = localStorage.getItem('token') ?? '';
    const localDataString = localStorage.getItem('viewHistory');

    if (localDataString) {
      const localData = JSON.parse(localDataString) as ILocalData;

      // Loại bỏ các đối tượng có episodeId là chuỗi rỗng
      localData.localData = localData.localData.filter(
        (item) => item.episodeId.trim() !== ''
      );

      if (localData.localData.length > 0) {
        this.loadLocalHistoryData(localData);
      }
    }

    // Sau đó subscribe để kiểm tra isAuth có thật sự là true không
    this.isAuth$.subscribe((isAuthenticated) => {
      console.log('Trạng thái isAuth$:', isAuthenticated); // Log ra true/false
      if (isAuthenticated && this.token) {
        // Nếu thật sự đăng nhập
        this.loadHistoryData();
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

  /**
   * Gọi API lấy dữ liệu lịch sử xem
   */
  loadHistoryData() {
    this.isLoading = true;
    this.movieService.getViewHistory(this.page - 1, this.size).subscribe({
      next: (res) => {
        // Tuỳ vào cấu trúc JSON trả về của bạn
        // ví dụ: res.data.content, res.data.totalElements
        if (res?.result) {
          this.historyData = res.result.content;
          this.totalItems = res.result.totalElements;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi khi lấy danh sách history: ', err);
        this.isLoading = false;
      },
    });
  }

  loadLocalHistoryData(localData: ILocalData) {
    this.isLoading = true;
    this.movieService
      .getLocalViewHistory(localData, this.pageLocal - 1, this.sizeLocal)
      .subscribe({
        next: (res) => {
          if (res?.result) {
            this.localHistoryData = res.result.content;
            this.totalItemsLocal = res.result.totalElements;
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Lỗi khi lấy danh sách history: ', err);
          this.isLoading = false;
        },
      });
  }

  deleteViewHistory(episodeId: string) {
    console.log('ID Xoá:', episodeId);
    this.movieService.deleteViewHistory(episodeId).subscribe({
      next: (res) => {
        sendNotification(
          this.store,
          'Đã xoá lịch sử tập phim!',
          res.message,
          'success'
        );
        this.loadHistoryData();
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  //Xoá 1 item trong localStorage
  deleteLocalViewHistory(episodeId: string) {
    // Đọc dữ liệu từ localStorage
    const localDataString = localStorage.getItem('viewHistory');
    let localData: ILocalData | null = null;

    if (localDataString) {
      localData = JSON.parse(localDataString) as ILocalData;

      // Kiểm tra xem localData có tồn tại và có dữ liệu không
      if (localData?.localData) {
        // Lọc bỏ phần tử có episodeId khớp với đối tượng cần xoá
        const updatedLocalData = localData.localData.filter(
          (item) => item.episodeId !== episodeId
        );

        // Cập nhật lại mảng localData với dữ liệu đã xoá phần tử
        localData.localData = updatedLocalData;

        // Ghi đè lại dữ liệu vào localStorage
        localStorage.setItem('viewHistory', JSON.stringify(localData));

        this.loadLocalHistoryData(localData);
        // Hiển thị thông báo và cập nhật giao diện
        sendNotification(
          this.store,
          'Đã xoá lịch sử tập phim từ LocalStorage!',
          'Lịch sử đã được xoá thành công.',
          'success'
        );
      }
    }
  }

  onClickEpisode(
    episodeId: string,
    durationWatched: number,
    historyId: string
  ): void {
    this.router.navigate(['/play', episodeId], {
      state: { durationWatched, historyId },
    });
  }

  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadHistoryData();
  }

  onLocalPageChange(newPage: number) {
    this.pageLocal = newPage;

    // Lấy lại dữ liệu từ localStorage mỗi khi người dùng thay đổi trang
    const localDataString = localStorage.getItem('viewHistory');

    if (localDataString) {
      const localDataParsed = JSON.parse(localDataString) as ILocalData;
      this.loadLocalHistoryData(localDataParsed); // Truyền localData đã phân tích
    }
  }
}
