import { Component, OnInit } from '@angular/core';
import { VideoSectionComponent } from '../../components/multi-structure/video-section/video-section.component';
import { MoviesService } from '../../services/api-service/movies.service';
import { IListThumbnails, IThumbnailCard } from '../../models/InterfaceData';
import { mapAnimeToThumbnail } from '../../utils/mapData';
import { IAnimeResponse } from '../../models/InterfaceResponse';
import { ActivatedRoute, Router } from '@angular/router';
import { sendNotification } from '../../utils/notification';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { MovieCardComponent } from '../../components/multi-structure/movie-card/movie-card.component';
import { PaginationComponent } from '../../components/regular/pagination/pagination.component';
import { LoadingOverlayComponent } from '../../components/regular/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-quick-search-list',
  imports: [
    CommonModule,
    MovieCardComponent,
    PaginationComponent,
    LoadingOverlayComponent,
  ],
  templateUrl: './quick-search-list.component.html',
  styleUrl: './quick-search-list.component.scss',
})
export class QuickSearchListComponent implements OnInit {
  newUpdate: IAnimeResponse[] = [];
  nameTag: string | undefined;
  type: string | undefined;
  categoryName: string = '';
  videos: IThumbnailCard[] = [];
  currentPageIndex: number = 1;
  itemsPerPage: number = 18;
  totalData: number = 0;
  loading = false;

  constructor(
    private moviesService: MoviesService,
    private store: Store,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const type = params.get('type') ?? '';
      this.type = type;
      const name = params.get('name-tag') ?? '';
      this.nameTag = name;
      if (this.nameTag && this.type) {
        this.fetchAnimeData();
      } else {
        sendNotification(
          this.store,
          'Không có gì cả!',
          'Không tìm thấy thể loại',
          'error'
        );
      }
    });
  }

  onPageChange(newPage: number) {
    this.currentPageIndex = newPage;
    const pageIndexForApi = newPage - 1;
    this.fetchAnimeData(pageIndexForApi);
  }

  private fetchAnimeData(pageIndex: number = 0) {
    this.loading = true;
    let filterParams = {};
    if (this.type === 'the-loai') {
      filterParams = { genreNames: [this.nameTag] };
    } else if (this.type === 'nam') {
      filterParams = { releaseYearNames: [this.nameTag] };
    } else if (this.type === 'lich-chieu') {
      filterParams = { scheduleNames: [this.nameTag] };
    }

    this.moviesService
      .filterAnimeAdvance(filterParams, pageIndex, this.itemsPerPage)
      .subscribe({
        next: (res) => {
          this.newUpdate = res.result.content;
          this.currentPageIndex = res.result.pageable.pageNumber + 1;
          this.totalData = res.result.totalElements;
          this.itemsPerPage = res.result.pageable.pageSize;
          const mappedThumbnails: IThumbnailCard[] = this.newUpdate.map(
            (anime) => mapAnimeToThumbnail(anime)
          );
          this.videos = mappedThumbnails;
          this.loading = false;
        },
        error: (err) => {
          console.log(err);
          // Nên tắt loading cả khi gặp lỗi
          this.loading = false;
        },
      });
  }
}
