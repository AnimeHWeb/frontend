import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ElementRef,
  HostListener,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DisplayCardComponent } from '../../regular/display-card/display-card.component';
import { MoviesService } from '../../../services/api-service/movies.service';
import { Subscription } from 'rxjs';
import { API_CONFIG } from '../../../services/config-service/config';
import { sizeImg } from '../../../models/DataRoot';
import { buildImageUrl } from '../../../utils/stringProcess';

interface Field {
  label: string;
  value: string;
}

interface CardItem {
  imageUrl: string;
  animeId: string;
  title: string;
  fields: Field[];
}

@Component({
  selector: 'app-list-search',
  standalone: true,
  imports: [CommonModule, DisplayCardComponent],
  templateUrl: './list-search.component.html',
  styleUrls: ['./list-search.component.scss'],
})
export class ListCardComponent implements OnChanges, OnDestroy {
  @Input() searchText: string = '';
  @Input() isVisible: boolean = false;

  @ViewChild('listContainer') listContainer!: ElementRef;

  cardList: CardItem[] = [];
  filteredList: CardItem[] = [];
  isLoading = false;

  // Quản lý phân trang
  private pageIndex = 0;
  private pageSize = 5;
  private hasMore = true;

  private searchTimeout: any;
  private apiSubscription?: Subscription;

  constructor(private moviesService: MoviesService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchText']) {
      // Mỗi lần searchText thay đổi => reset page về 0, xoá danh sách
      this.pageIndex = 0;
      this.cardList = [];
      this.filteredList = [];
      this.hasMore = true;

      this.handleSearch();
    }
  }

  handleSearch(): void {
    const text = this.searchText.trim();
    this.isVisible = true;

    // Hủy API trước đó nếu có
    if (this.apiSubscription) {
      this.apiSubscription.unsubscribe();
    }

    // Clear timeout debounce cũ
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    if (!text) {
      this.filteredList = [];
      this.isVisible = false;
      return;
    }

    // Đặt timeout để debounce 500ms
    this.isLoading = true;
    this.searchTimeout = setTimeout(() => {
      this.fetchData(text, this.pageIndex);
    }, 500);
  }

  /** Gọi API lấy dữ liệu theo pageIndex */
  private fetchData(search: string, pageIndex: number) {
    // Tạo payload IMovieQuery
    const dataSearch = {
      title: search,
      partialTitle: true,
    };

    this.apiSubscription = this.moviesService
      .filterAnimeAdvance(dataSearch, pageIndex, this.pageSize)
      .subscribe({
        next: (response) => {
          const content = response.result?.content || [];

          // Map API -> CardItem
          const newCards = content.map(
            (anime) =>
              ({
                imageUrl: buildImageUrl(anime.posterUrl, 'small'),
                title: anime.title,
                animeId: anime.id,
                fields: [
                  { label: 'Đánh giá', value: anime.averageRating?.toString() },
                  {
                    label: 'Số tập',
                    value: anime.expectedEpisodes?.toString(),
                  },
                  {
                    label: 'Lượt xem',
                    value: anime.viewCount?.toString() ?? '0',
                  },
                ],
              } as CardItem)
          );

          // Nối thêm vào cardList
          this.cardList = [...this.cardList, ...newCards];

          // Nếu số item trả về < pageSize => không còn trang kế
          if (newCards.length < this.pageSize) {
            this.hasMore = false;
          }

          // Lọc cục bộ (nếu muốn)
          this.filterCards();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Lỗi khi tìm kiếm anime:', error);
          this.filteredList = [];
          this.isLoading = false;
          this.hasMore = false;
        },
      });
  }

  /** Khi user cuộn đến đáy container => load trang kế nếu có */
  onScroll(event: Event) {
    // Nếu đang loading hoặc không còn trang kế => return
    if (this.isLoading || !this.hasMore) return;

    const element = event.target as HTMLElement;
    const atBottom =
      element.scrollHeight - element.scrollTop <= element.clientHeight + 1;
    if (atBottom) {
      // Tăng pageIndex rồi gọi API
      this.pageIndex++;
      this.isLoading = true;
      this.fetchData(this.searchText.trim(), this.pageIndex);
    }
  }

  handleCardClick(index: number): void {
    console.log(`🎬 Card ${index} được nhấn!`);
    this.isVisible = false;
  }

  filterCards(): void {
    const search = this.searchText.toLowerCase();
    this.filteredList = this.cardList.filter((card) =>
      card.title.toLowerCase().includes(search)
    );
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {
    if (
      this.listContainer &&
      !this.listContainer.nativeElement.contains(event.target)
    ) {
      this.isVisible = false;
    }
  }

  ngOnDestroy(): void {
    if (this.apiSubscription) {
      this.apiSubscription.unsubscribe();
    }
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
}
