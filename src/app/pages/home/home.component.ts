import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { MoviesService } from '../../services/api-service/movies.service';
import { IAnimeResponse } from '../../models/InterfaceResponse';
import { IListThumbnails, IThumbnailCard } from '../../models/InterfaceData';
import { sizeImg } from '../../models/DataRoot';
import { MovieCardComponent } from '../../components/multi-structure/movie-card/movie-card.component';
import { FooterComponent } from '../../components/layout/footer/footer.component';
import { mapAnimeToThumbnail } from '../../utils/mapData';
import { API_CONFIG } from '../../services/config-service/config';
import { forkJoin } from 'rxjs';
import { VideoSectionComponent } from '../../components/multi-structure/video-section/video-section.component';
import { LoadingOverlayComponent } from '../../components/regular/loading-overlay/loading-overlay.component';
import { buildImageUrl } from '../../utils/stringProcess';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    CommonModule,
    MovieCardComponent,
    FooterComponent,
    VideoSectionComponent,
    LoadingOverlayComponent,
  ],
})
export class HomeComponent implements OnInit {
  ipServer = API_CONFIG.BASE_URLS.MAIN_API;
  sizeImg = sizeImg;
  videos: IListThumbnails[] = []; // Mảng danh mục chứa danh sách video
  topvideos: IThumbnailCard[] = [];
  homeBanner: IAnimeResponse[] = [];
  mainBanner: string = '';
  isLoading = false;
  defaultBanner: string = 'assets/placeholder-banner.png';

  randomId: string = '';

  allAnime: IAnimeResponse[] = [];
  newUpdate: IAnimeResponse[] = [];
  nominated: IAnimeResponse[] = [];

  constructor(private moviesService: MoviesService, private router: Router) {}

  ngOnInit(): void {
    this.isLoading = true;
    // 1. Lấy danh sách videos
    // this.moviesService.getCategoryList().subscribe({
    //   next: (response) => {
    //     this.videos = response.result || [];

    //     // Lấy danh sách videos từ category "top xem nhiều nhất"
    //     const topCategory = this.videos.find(
    //       (category) => category.category === 'Top xem nhiều nhất'
    //     );
    //     this.topvideos = topCategory ? topCategory.videos : [];
    //   },
    // });

    forkJoin({
      topAnimes: this.moviesService.getTop4Animes(),
      allAnime: this.moviesService.getAllAnime(0, 9),
      newUpdate: this.moviesService.filterAnimeAdvance(
        { newlyUpdated: true },
        0,
        9
      ),
      nominated: this.moviesService.filterAnimeAdvance(
        { nominated: true },
        0,
        9
      ),
    }).subscribe({
      next: ({ topAnimes, allAnime, newUpdate, nominated }) => {
        this.homeBanner = topAnimes.result;
        this.mainBanner = this.buildBannerUrl(
          this.homeBanner[0] ? this.homeBanner[0].bannerUrl : null,
          'original'
        );

        this.allAnime = allAnime.result.content;
        this.newUpdate = newUpdate.result.content;
        this.nominated = nominated.result.content;
        const animeCategoryAllAnime: IListThumbnails = {
          category: 'Danh sách tất cả Anime',
          useApi: 'FAA',
          query: { movieQueries: {} },
          videos: this.allAnime.map((anime) => mapAnimeToThumbnail(anime)),
        };
        const animeCategoryNominated: IListThumbnails = {
          category: 'Đề cử',
          useApi: 'FAA',
          query: { movieQueries: { nominated: true } },
          videos: this.newUpdate.map((anime) => mapAnimeToThumbnail(anime)),
        };
        const animeCategoryNewlyUpdate: IListThumbnails = {
          category: 'Mới cập nhật',
          useApi: 'FAA',
          query: { movieQueries: { newlyUpdated: true } },
          videos: this.newUpdate.map((anime) => mapAnimeToThumbnail(anime)),
        };

        this.videos.push(animeCategoryNewlyUpdate);
        this.videos.push(animeCategoryNominated);
        this.videos.push(animeCategoryAllAnime);
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
  }

  buildBannerUrl(
    bannerUrl: string | null,
    size: 'tiny' | 'small' | 'original'
  ): string {
    if (bannerUrl) {
      return buildImageUrl(bannerUrl, size);
    } else {
      return this.defaultBanner;
    }
  }

  onClickRandomAnime() {
    this.isLoading = true;
    this.moviesService.getRandomAnime().subscribe({
      next: (res) => {
        this.randomId = res.result.id;
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/film-details', this.randomId]);
        }, 200);
      },
    });
  }

  onClickShowMore(categoryName: string) {
    this.router.navigate(['/category', categoryName]);
  }

  onClickWatchNow(id: string) {
    this.router.navigate(['/film-details', id]);
  }
}
