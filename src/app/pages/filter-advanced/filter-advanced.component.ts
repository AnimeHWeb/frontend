import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MoviesService } from '../../services/api-service/movies.service';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ITagFilmResponse } from '../../models/InterfaceResponse';
import { selectTagList } from '../../store/tag-film/tag-film.selector';
import { IMovieQuery } from '../../models/InterfaceData';
import { IAnimeResponse } from '../../models/InterfaceResponse';
import { sizeImg } from '../../models/DataRoot';
import { API_CONFIG } from '../../services/config-service/config';
import { PaginationComponent } from '../../components/regular/pagination/pagination.component';
import { Router } from '@angular/router';
import { buildImageUrl } from '../../utils/stringProcess';

interface TagGroupConfig {
  label: string; // Tiêu đề hiển thị
  type: string; // Loại tag để filter (ví dụ: 'Studio', 'Năm phát hành', …)
  paramName: keyof IMovieQuery; // Tên trường trong IMovieQuery
  data: ITagFilmResponse[]; // Mảng tag (sẽ gán sau khi subscribe)
  selected: string[]; // Mảng tên tag đã chọn
  isOpen?: boolean; // Đánh dấu dropdown mở hay đóng
}

@Component({
  selector: 'app-filter-advanced',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './filter-advanced.component.html',
  styleUrls: ['./filter-advanced.component.scss'],
})
export class FilterAdvancedComponent implements OnInit {
  // Mảng cấu hình cho từng nhóm tag
  tagGroups: TagGroupConfig[] = [
    {
      label: 'Studio',
      type: 'Studio',
      paramName: 'studioNames',
      data: [],
      selected: [],
      isOpen: false,
    },
    {
      label: 'Năm phát hành',
      type: 'Năm phát hành',
      paramName: 'releaseYearNames',
      data: [],
      selected: [],
      isOpen: false,
    },
    {
      label: 'Quốc gia',
      type: 'Quốc gia',
      paramName: 'countryNames',
      data: [],
      selected: [],
      isOpen: false,
    },
    {
      label: 'Loại phim',
      type: 'Loại phim',
      paramName: 'movieTypes',
      data: [],
      selected: [],
      isOpen: false,
    },
    {
      label: 'Tình trạng',
      type: 'Tình trạng',
      paramName: 'statusFilters',
      data: [],
      selected: [],
      isOpen: false,
    },
    {
      label: 'Thể loại',
      type: 'Thể loại',
      paramName: 'genreNames',
      data: [],
      selected: [],
      isOpen: false,
    },
    {
      label: 'Lịch chiếu phim',
      type: 'Lịch chiếu phim',
      paramName: 'scheduleNames',
      data: [],
      selected: [],
      isOpen: false,
    },
  ];

  // Phân trang
  currentPageIndex = 1;
  itemsPerPage = 8;
  totalData = 0;

  // Kết quả filter
  filteredAnimes: IAnimeResponse[] = [];
  loading = false;

  // Lấy tag từ store
  tags$: Observable<ITagFilmResponse[]>;

  // Lưu lại các điều kiện filter để dùng khi chuyển trang
  lastFilterParams: IMovieQuery = {};

  constructor(
    private moviesService: MoviesService,
    private store: Store,
    private router: Router
  ) {
    this.tags$ = this.store.select(selectTagList);
  }

  ngOnInit(): void {
    // Phân bổ các tag theo type từ store cho từng group
    this.tags$.subscribe((allTags) => {
      for (const group of this.tagGroups) {
        group.data = allTags.filter((tag) => tag.type === group.type);
      }
    });
  }

  buildImgThumbnailUrl(
    url: string,
    size: 'small' | 'tiny' | 'original'
  ): string {
    return buildImageUrl(url, size);
  }

  // Toggle method dùng chung cho mọi nhóm dropdown
  toggleTag(group: TagGroupConfig, tagName: string): void {
    if (group.selected.includes(tagName)) {
      group.selected = group.selected.filter((n) => n !== tagName);
    } else {
      group.selected.push(tagName);
    }
  }

  goToFilmDetails(animeId: string) {
    this.router.navigate(['/film-details', animeId]);
  }

  // Hàm onFilter: tạo object filterParams chỉ gồm các trường có dữ liệu, gọi API và lưu vào lastFilterParams
  onFilter(): void {
    const filterParams: IMovieQuery = {};

    // Duyệt từng group: nếu group.selected.length > 0, gán vào filterParams
    for (const group of this.tagGroups) {
      if (group.selected.length > 0) {
        (filterParams[group.paramName] as string[]) = [...group.selected];
      }
    }

    console.log('Filter params:', filterParams);
    // Lưu lại các điều kiện filter để sử dụng cho pagination
    this.lastFilterParams = filterParams;

    this.loading = true;
    this.moviesService
      .filterAnimeAdvance(
        filterParams,
        this.currentPageIndex - 1,
        this.itemsPerPage
      )
      .subscribe({
        next: (res) => {
          const pageRes = res.result;
          this.filteredAnimes = pageRes.content;
          this.totalData = pageRes.totalElements;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        },
      });
  }

  onClear(): void {
    this.lastFilterParams = {};
    this.tagGroups.forEach((group) => {
      group.selected = [];
      // group.isOpen = false; // optional: đóng dropdown nếu cần
    });
  }

  // Hàm onPageChange được gọi từ component pagination
  onPageChange(newPage: number): void {
    if (newPage >= 1 && newPage !== this.currentPageIndex) {
      this.currentPageIndex = newPage;
      this.loading = true;
      this.moviesService
        .filterAnimeAdvance(
          this.lastFilterParams,
          newPage - 1,
          this.itemsPerPage
        )
        .subscribe({
          next: (res) => {
            const pageRes = res.result;
            this.filteredAnimes = pageRes.content;
            this.totalData = pageRes.totalElements;
            this.loading = false;
          },
          error: (err) => {
            console.error(err);
            this.loading = false;
          },
        });
    }
  }
}
