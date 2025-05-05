import {
  ChangeDetectorRef,
  Component,
  Input,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownButtonComponent } from '../../regular/dropdown/dropdown.component';
import { InteractiveButtonComponent } from '../../regular/button/button.component';
import { MarsStroke, Bookmark, LucideAngularModule } from 'lucide-angular';
import { ActivatedRoute, Router } from '@angular/router';
import { IEpisodeInAnimeResponse } from '../../../models/InterfaceResponse';
import { API_CONFIG } from '../../../services/config-service/config';
import { sizeImg } from '../../../models/DataRoot';
import { MoviesService } from '../../../services/api-service/movies.service';
import { sendNotification } from '../../../utils/notification';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectIsAuthenticated } from '../../../store/auth/auth.selectors';
import { ILocalWatchlistData } from '../../../models/InterfaceData';
import { buildImageUrl } from '../../../utils/stringProcess';
import { CookieService } from 'ngx-cookie-service';

export interface IOptionSeason {
  value: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-movie-info',
  standalone: true,
  imports: [
    CommonModule,
    DropdownButtonComponent,
    InteractiveButtonComponent,
    LucideAngularModule,
  ],
  templateUrl: './movie-info.component.html',
  styleUrls: ['./movie-info.component.scss'],
})
export class MovieInfoComponent {
  @Input() movie: any; // Nhận dữ liệu phim từ component cha
  @Input() background: string = '';
  @Input() id: string = '';
  @Input() thumbnail: string = '';
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() totalViews: number = 0;
  @Input() latestEpisodes: IEpisodeInAnimeResponse[] = [];
  @Input() rating: number = 0;
  @Input() numberOfRating: number = 0;
  @Input() genres: string[] = [];
  @Input() followers: number = 0;
  @Input() status: string = '';
  @Input() country: string = '';
  @Input() studio: string = '';
  @Input() schedule: string = '';
  @Input() follow: boolean = false;
  @Input() seasons: IOptionSeason[] = [];
  @Input() submittedByUsername: string = '';

  imgThumbnail: string = '';
  imgBackground: string = '';
  selectedRating: number = 0;
  ratingLabel: string = '';
  hoveredRating: number = 0;
  imgDefault = 'assets/thumbnail-default.jpg';
  movieId: string = '';
  isAuth$: Observable<boolean>;
  token: string = '';
  role: string = '';
  localDataWatchlist: ILocalWatchlistData[] = [];
  isUserAuthenticated = false; // biến cục bộ
  voteAble = true;

  ratingLabels: string[] = [
    'Tệ',
    'Không hay',
    'Bình thường',
    'Khá hay',
    'Rất hay',
    'Tuyệt vời',
    'Xuất sắc',
    'Cực đỉnh',
    'Hoàn hảo',
    'Huyền thoại',
  ];

  selectedSeason = {
    value: '-1',
    label: 'Chọn phần',
  };

  constructor(
    private router: Router,
    private movieService: MoviesService,
    private store: Store,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private cookies: CookieService
  ) {
    this.isAuth$ = this.store.select(selectIsAuthenticated);
    this.token = localStorage.getItem('token') ?? '';
    this.selectedRating = this.rating;
    this.role = cookies.get('role');
  }

  ngOnInit() {
    this.selectedRating = this.rating;

    this.imgThumbnail = buildImageUrl(this.thumbnail, 'small');

    this.imgBackground = buildImageUrl(this.background, 'original');

    this.route.paramMap.subscribe((params) => {
      const movieId = params.get('id') ?? '';
      this.movieId = movieId;
    });

    // Kiểm tra nếu người dùng chưa đăng nhập
    this.isAuth$.subscribe((isAuthenticated) => {
      this.isUserAuthenticated = isAuthenticated;
      if (!isAuthenticated && !this.token) {
        const localData: ILocalWatchlistData = JSON.parse(
          localStorage.getItem('watchlist') ?? '{"localWatchlistData": []}'
        );
        console.log('Data Watchlist hiện tại:', localData);

        // Kiểm tra xem movieId có trong watchlist không
        const isExist = localData.localWatchlistData.some(
          (item) => item.animeId === this.movieId
        );
        if (isExist) {
          this.follow = true; // Nếu có trong watchlist, set follow = true
        } else {
          this.follow = false; // Nếu không có trong watchlist, set follow = false
        }

        // Gọi detectChanges để buộc Angular nhận diện sự thay đổi của `follow`
        this.cdRef.detectChanges();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Kiểm tra nếu giá trị của thumbnail hoặc background thay đổi
    if (changes['thumbnail'] || changes['background']) {
      this.imgThumbnail = buildImageUrl(this.thumbnail, 'original');
      this.imgBackground = buildImageUrl(this.background, 'original');
    }

    if (changes['rating']) {
      this.rating = changes['rating'].currentValue;
      this.selectedRating = this.rating;
    }

    // Nếu movie thay đổi và trong movie có các thuộc tính thumbnail, background,
    // bạn có thể cập nhật lại chúng
    if (changes['movie'] && changes['movie'].currentValue) {
      const movie = changes['movie'].currentValue;
      this.imgThumbnail = buildImageUrl(movie.thumbnail, 'original');
      this.imgBackground = buildImageUrl(movie.background, 'original');
    }
  }

  setRating(star: number) {
    if (this.status === 'approved' && this.token) {
      this.selectedRating = star;
      this.movieService.ratingAnime(this.movieId, star).subscribe({
        next: (res) => {
          sendNotification(this.store, 'Đã đánh giá!', res.message, 'success');
          this.rating = res.result;
          if (this.voteAble) {
            this.numberOfRating += 1;
            this.voteAble = false;
          }
        },
        error: (err) => {
          sendNotification(this.store, 'Lỗi!', 'Có lỗi xảy ra', 'error');
          console.log(err);
        },
      });
    } else if (this.status !== 'approved') {
      sendNotification(
        this.store,
        'Thông báo!',
        ' Anime chưa được duyệt. Không thể Vote',
        'warning'
      );
    } else if (!this.token || !this.isUserAuthenticated) {
      sendNotification(
        this.store,
        'Thông báo!',
        'Yêu cầu đăng nhập để Vote',
        'warning'
      );
    } else {
      sendNotification(
        this.store,
        'Lỗi!',
        'Có lỗi thì thực hiện hành động.',
        'error'
      );
    }
  }

  handleSelect(select: any) {
    if (select) {
      this.selectedSeason = select;
    } else {
      // Nếu select là null thì gán lại giá trị mặc định
      this.selectedSeason = { value: '-1', label: 'Chọn phần' };
    }
    this.router.navigate(['/film-details', this.selectedSeason.value]);
  }

  handleClickPlayThumbnail() {
    if (this.latestEpisodes.length > 0) {
      this.router.navigate(['/play', this.id]);
    } else {
      sendNotification(
        this.store,
        'Hmm...',
        'Có vẻ như chưa có tập phim nào, quay lại sau nhé!',
        'warning'
      );
    }
  }

  onClickEpisode(episodeId: string): void {
    this.router.navigate(['/play', episodeId]);
  }

  onClick() {
    console.log('Bắt đầu...');
    this.cdRef.detectChanges();

    // Hàm gửi thông báo chung
    const sendWatchlistNotification = (
      title: string,
      message: string,
      type: 'success' | 'info' | 'warning' | 'error'
    ) => {
      sendNotification(this.store, title, message, type);
    };

    // Hàm xử lý watchlist local
    const handleWatchlist = (isAdd: boolean) => {
      const localData: ILocalWatchlistData = JSON.parse(
        localStorage.getItem('watchlist') ?? '{"localWatchlistData": []}'
      );
      console.log('Data Watchlist hiện tại:', localData);

      if (isAdd) {
        const now = new Date();
        const localISOTime = new Date(
          now.getTime() - now.getTimezoneOffset() * 60000
        )
          .toISOString()
          .substring(0, 19);
        localData.localWatchlistData.unshift({
          animeId: this.movieId,
          dateAdded: localISOTime,
        });
      } else {
        const index = localData.localWatchlistData.findIndex(
          (item) => item.animeId === this.movieId
        );
        if (index !== -1) {
          localData.localWatchlistData.splice(index, 1);
        }
      }

      localStorage.setItem('watchlist', JSON.stringify(localData));
      this.follow = isAdd;
      sendWatchlistNotification(
        isAdd ? 'Đã thêm!' : 'Đã gỡ!',
        isAdd
          ? `Đã thêm ${this.title} vào watchlist của bạn.`
          : `Đã gỡ ${this.title} khỏi watchlist.`,
        'success'
      );
    };

    // Kiểm tra trạng thái đăng nhập
    if (this.isUserAuthenticated && this.token) {
      if (this.follow) {
        this.movieService.removeAnimeFromWatchlist(this.movieId).subscribe({
          next: (res) => {
            sendWatchlistNotification('Đã gỡ!', res.message, 'success');
            this.follow = false;
          },
          error: (err) => {
            console.log(err);
          },
        });
      } else {
        this.movieService.addAnimeToWatchlist(this.movieId).subscribe({
          next: (res) => {
            console.log(res);
            sendWatchlistNotification(
              'Đã thêm!',
              `Đã thêm ${this.title} vào watchlist`,
              'success'
            );
            this.follow = true;
          },
          error: (err) => {
            console.log(err);
          },
        });
      }
    } else {
      console.log('chưa đăng nhập');
      const localData: ILocalWatchlistData = JSON.parse(
        localStorage.getItem('watchlist') ?? '{"localWatchlistData": []}'
      );
      console.log('Data Watchlist hiện tại:', localData);

      // Kiểm tra xem movieId có trong watchlist không
      const isExist = localData.localWatchlistData.some(
        (item) => item.animeId === this.movieId
      );
      if (isExist) {
        this.follow = true;
      } else {
        this.follow = false;
      }

      handleWatchlist(!this.follow); // Thêm hoặc xóa tùy theo trạng thái follow hiện tại
    }
  }

  onHover(star: number) {
    this.hoveredRating = star;
    this.ratingLabel = this.ratingLabels[star - 1]; // Gán mức đánh giá anime
  }

  onLeave() {
    this.hoveredRating = 0;
    this.ratingLabel = '';
  }
}
