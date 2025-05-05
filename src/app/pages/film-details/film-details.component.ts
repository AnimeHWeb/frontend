// film-details.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IOptionSeason,
  MovieInfoComponent,
} from '../../components/multi-structure/movie-info/movie-info.component';
import { TrailerEpisodesComponent } from '../../components/multi-structure/trailer-episodes/trailer-episodes.component';
import { CommentFilmComponent } from '../../components/multi-structure/comment/comment-film.component';
import { IMovie } from '../../models/InterfaceData';
import {
  IAnimeResponse,
  ICommentFilmResponse,
} from '../../models/InterfaceResponse';
import { MoviesService } from '../../services/api-service/movies.service';
import { SERVER_RESPONSE } from '../../models/ApiResponse';
import { FilmApprovalComponent } from '../../components/multi-structure/film-approval/film-approval.component';
import { CookieService } from 'ngx-cookie-service';
import { Store } from '@ngrx/store';
import { closeForm, openForm } from '../../store/open-form-state/form.actions';
import { UpdateAnimeComponent } from '../../components/popup-form/update-anime/update-anime.component';
import { sendNotification } from '../../utils/notification';
import { LoadingOverlayComponent } from '../../components/regular/loading-overlay/loading-overlay.component';
import { formatDateToDDMMYYYY } from '../../utils/stringProcess';
import { CreateEpisodeFormComponent } from '../../components/popup-form/create-episode-form/create-episode-form.component';
import { Observable } from 'rxjs';
import { selectOpenedForms } from '../../store/open-form-state/form.selectors';

// Hàm map
function mapAnimeToIMovie(anime: IAnimeResponse): IMovie {
  return {
    id: anime.id,
    title: anime.title,
    description: anime.description,
    background: anime.bannerUrl,
    thumbnail: anime.posterUrl,
    trailer: anime.trailerUrl,
    totalView: anime.viewCount ?? 0,
    newEpisodes: anime.episodes?.slice(-3),
    totalEpisodes: anime.episodes,
    releaseDate:
      formatDateToDDMMYYYY(anime.publishingSchedule?.scheduleDate || '') || '',
    rating: anime.averageRating,
    numberOfRating: anime.ratingCount,
    genres:
      anime.typeItems
        ?.filter((tag) => tag.type === 'Thể loại')
        .map((t) => t.name) || [],
    followers: anime.followCount,
    status: anime.statusSubmitted,
    country: anime.typeItems
      ?.filter((tag) => tag.type === 'Quốc gia')
      .map((t) => t.name)[0],
    studio: anime.typeItems
      ?.filter((tag) => tag.type === 'Studio')
      .map((t) => t.name)[0],
    schedule: anime.typeItems
      ?.filter((tag) => tag.type === 'Lịch chiếu phim')
      .map((t) => t.name)[0],
    seasons: [],
    follow: anime.inWatchlist,
    submittedBy: anime.submittedBy,
  };
}

export function maptIAnimeResponseToIOptionSeason(
  anime: IAnimeResponse
): IOptionSeason {
  return {
    value: anime.id,
    label: anime.title,
    disabled: !(anime.statusSubmitted === 'approved'),
  };
}

@Component({
  selector: 'app-film-details',
  standalone: true,
  imports: [
    CommonModule,
    MovieInfoComponent,
    TrailerEpisodesComponent,
    CommentFilmComponent,
    FilmApprovalComponent,
    UpdateAnimeComponent,
    LoadingOverlayComponent,
    CreateEpisodeFormComponent,
  ],
  templateUrl: './film-details.component.html',
  styleUrls: ['./film-details.component.scss'],
})
export class FilmDetailsComponent implements OnInit {
  movie: IMovie | null = null;
  series: IOptionSeason[] = [];
  commentsData: ICommentFilmResponse[] = [];
  isOpenForm$: Observable<{ [key: string]: boolean }>;
  movieId: string | null = '';
  firstEpisodeId: string | null = '';
  role: string;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private moviesService: MoviesService,
    private cookieService: CookieService,
    private store: Store
  ) {
    this.role = this.cookieService.get('role');
    this.isOpenForm$ = this.store.select(selectOpenedForms);
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const movieId = params.get('id');
      this.movieId = movieId;
      this.fetchMovieData(movieId);
    });
  }

  fetchMovieData(movieId: string | null) {
    if (!movieId) return;

    this.isLoading = true;
    // Gọi API thật (nếu có). Ví dụ:
    this.moviesService.getAnimeById(movieId).subscribe({
      next: (anime: SERVER_RESPONSE<IAnimeResponse>) => {
        // Map từ IAnimeResponse => IMovie
        this.movie = mapAnimeToIMovie(anime.result);
        this.firstEpisodeId =
          this.movie.newEpisodes?.[this.movie.newEpisodes.length - 1]?.id;
        this.fetchSeries(anime.result.series.id);
        this.isLoading = false;
        // Sau đó bạn có thể fetch comment...
      },
      error: (err) => {
        console.error('Lỗi khi gọi API:', err);
        this.isLoading = false;
        this.router.navigate(['/']);
      },
    });
  }

  fetchSeries(seriesId: string) {
    this.moviesService.getAnimesInSeries(seriesId).subscribe({
      next: (response) => {
        this.series = response.result.map(maptIAnimeResponseToIOptionSeason);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  openFormUpdate() {
    this.store.dispatch(openForm({ formType: 'update-anime' }));
  }

  revertAnime() {
    if (this.movieId) {
      this.moviesService.revertAnimeToPending(this.movieId).subscribe({
        next: (res) => {
          sendNotification(
            this.store,
            'Đã ngừng phát hành',
            res.message,
            'success'
          );
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        },
        error: (err) => {
          sendNotification(this.store, 'Lỗi!', 'Có vấn đề xảy ra', 'error');
        },
      });
    }
  }

  closePopup() {
    this.store.dispatch(closeForm({ formType: 'create-episode' }));
  }
}
