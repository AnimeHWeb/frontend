import { Component, HostListener } from '@angular/core';
import { MoviesService } from '../../services/api-service/movies.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IListThumbnails, IThumbnailCard } from '../../models/InterfaceData';
import { AddSeriesComponent } from '../../components/multi-structure/add-series/add-series.component';
import { animate, style, transition, trigger } from '@angular/animations';
import { CreateAnimePendingComponent } from '../../components/multi-structure/create-anime-pending/create-anime-pending.component';
import { CreateTagComponent } from '../../components/multi-structure/create-tag/create-tag.component';
import { CookieService } from 'ngx-cookie-service';
import { TagListComponent } from '../../components/multi-structure/tag-list/tag-list.component';
import { API_CONFIG } from '../../services/config-service/config';
import { sizeImg } from '../../models/DataRoot';
import { forkJoin } from 'rxjs';
import { mapAnimeToThumbnail } from '../../utils/mapData';
import { VideoSectionComponent } from '../../components/multi-structure/video-section/video-section.component';
import { LoadingOverlayComponent } from '../../components/regular/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-uploaded-film',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddSeriesComponent,
    CreateAnimePendingComponent,
    CreateTagComponent,
    TagListComponent,
    VideoSectionComponent,
    LoadingOverlayComponent,
  ],
  templateUrl: './uploaded-film.component.html',
  styleUrl: './uploaded-film.component.scss',
  animations: [
    trigger('expandCollapse', [
      transition(':enter', [
        style({ height: '0px', opacity: 0 }),
        animate('0.3s ease-out', style({ height: '410px', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('0.3s ease-in', style({ height: '0px', opacity: 0 })),
      ]),
    ]),
    trigger('expandCollapseAnime', [
      transition(':enter', [
        style({ height: '0px', opacity: 0 }),
        animate('0.3s ease-out', style({ height: '678px', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('0.3s ease-in', style({ height: '0px', opacity: 0 })),
      ]),
    ]),
    trigger('expandCollapseCreateTag', [
      transition(':enter', [
        style({ height: '0px', opacity: 0 }),
        animate('0.3s ease-out', style({ height: '508px', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('0.3s ease-in', style({ height: '0px', opacity: 0 })),
      ]),
    ]),
  ],
})
export class UploadedFilmComponent {
  videos: IListThumbnails[] = [];
  isDropdownOpen = false;
  isAddingSeries = false;
  isCreateAnimePending = false;
  isCreateTag = false;
  role: string;
  isLoading = false;
  username: string = '';

  queryReject = {
    statusFilters: ['rejected'],
    submittedByUsername: this.username,
  };
  queryPending = {
    statusFilters: ['pending'],
    submittedByUsername: this.username,
  };
  queryApproved = {
    statusFilters: ['approved'],
    submittedByUsername: this.username,
  };

  constructor(
    private moviesService: MoviesService,
    private cookie: CookieService
  ) {
    this.role = this.cookie.get('role') ?? '';
    this.username = this.cookie.get('username');
    this.queryApproved = {
      ...this.queryApproved,
      submittedByUsername: this.username,
    };
    this.queryReject = {
      ...this.queryReject,
      submittedByUsername: this.username,
    };
    this.queryPending = {
      ...this.queryPending,
      submittedByUsername: this.username,
    };
  }

  ngOnInit(): void {
    // Gọi 3 API song song cho mỗi status
    this.isLoading = true;
    const rejectedCall = this.moviesService.filterAnimeAdvance(
      this.queryReject,
      0,
      18
    );
    const pendingCall = this.moviesService.filterAnimeAdvance(
      this.queryPending,
      0,
      18
    );
    const approvedCall = this.moviesService.filterAnimeAdvance(
      this.queryApproved,
      0,
      18
    );

    forkJoin({
      rejected: rejectedCall,
      pending: pendingCall,
      approved: approvedCall,
    }).subscribe({
      next: (responses) => {
        // Mỗi phần tử responses.<key> tương ứng với kết quả từng call
        const { rejected, pending, approved } = responses;

        // Tạo 3 category dựa trên kết quả từng call
        const categoryRejected: IListThumbnails = {
          category: 'Phim bị từ chối',
          useApi: 'FAA',
          query: { movieQueries: this.queryReject },
          videos: this.mapToThumbnails(rejected.result.content),
        };
        const categoryPending: IListThumbnails = {
          category: 'Phim chờ duyệt',
          useApi: 'FAA',
          query: { movieQueries: this.queryPending },
          videos: this.mapToThumbnails(pending.result.content),
        };
        const categoryApproved: IListThumbnails = {
          category: 'Phim đã duyệt',
          useApi: 'FAA',
          query: { movieQueries: this.queryApproved },
          videos: this.mapToThumbnails(approved.result.content),
        };

        // Thêm vào mảng this.videos
        this.videos.push(categoryRejected);
        this.videos.push(categoryPending);
        this.videos.push(categoryApproved);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.log(err);
      },
    });
  }

  // Hàm tiện ích để map anime sang IThumbnailCard
  private mapToThumbnails(animeList: any[]): IThumbnailCard[] {
    return animeList.map((anime) => mapAnimeToThumbnail(anime));
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click')
  closeDropdown() {
    this.isDropdownOpen = false;
  }

  addNewSeries() {
    this.isAddingSeries = true;
    this.isCreateAnimePending = false;
    this.isCreateTag = false;
  }

  addNewAnimePending() {
    this.isCreateAnimePending = true;
    this.isAddingSeries = false;
    this.isCreateTag = false;
  }

  createTag() {
    this.isCreateAnimePending = false;
    this.isAddingSeries = false;
    this.isCreateTag = true;
  }

  cancelSeries() {
    this.isAddingSeries = false;
  }

  cancelAnime() {
    this.isCreateAnimePending = false;
  }

  cancelCreateTag() {
    this.isCreateTag = false;
  }
}
