import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { map, Observable } from 'rxjs';
import { closeForm } from '../../../store/open-form-state/form.actions';
import {
  IOptionDropType,
  IMovie,
  IMovieUpdate,
} from '../../../models/InterfaceData';
import { sendNotification } from '../../../utils/notification';
import { InteractiveButtonComponent } from '../../regular/button/button.component';
import { DynamicInputComponent } from '../../regular/input/input.component';
import { DropdownButtonComponent } from '../../regular/dropdown/dropdown.component';
import { CommonModule } from '@angular/common';
import { selectOpenedForms } from '../../../store/open-form-state/form.selectors';
import { MoviesService } from '../../../services/api-service/movies.service';
import { ITagFilmResponse } from '../../../models/InterfaceResponse';
import { selectTagList } from '../../../store/tag-film/tag-film.selector';
import { truncateString } from '../../../utils/stringProcess';

// Định nghĩa defaultMovie với tất cả các giá trị được khởi tạo
const defaultMovie: IMovie = {
  id: '',
  title: '',
  description: '',
  background: '',
  thumbnail: '',
  trailer: '',
  totalView: 0,
  newEpisodes: [],
  totalEpisodes: [],
  releaseDate: '',
  rating: 0,
  numberOfRating: 0,
  genres: [],
  followers: 0,
  status: '',
  country: '',
  studio: '',
  schedule: '',
  seasons: [],
  follow: false,
  submittedBy: '',
};

@Component({
  selector: 'app-update-anime',
  imports: [
    CommonModule,
    InteractiveButtonComponent,
    DynamicInputComponent,
    DropdownButtonComponent,
  ],
  templateUrl: './update-anime.component.html',
  styleUrls: ['./update-anime.component.scss'],
})
export class UpdateAnimeComponent implements OnChanges {
  @Input() movieInfo: IMovie | null = defaultMovie;
  @Input() animeId: string = '';

  openedForms$: Observable<{ [key: string]: boolean }>;
  loading = false;
  shouldValidate = false;

  // Khởi tạo data với giá trị mặc định từ defaultMovie
  data: IMovie = { ...defaultMovie };
  posterFile: File | null = null;
  bannerFile: File | null = null;
  // Các dropdown cho các thuộc tính trong IMovie

  // Các nhãn hiển thị được chọn cho dropdown
  selectedStatusLabel = 'Chọn trạng thái';
  selectedReleaseYearLabel = 'Chọn năm phát hành';
  selectedStudioLabel = 'Chọn studio';
  selectedScheduleLabel = 'Chọn lịch chiếu';
  selectedGenreLabel = 'Chọn thể loại';
  selectedCountryLabel = 'Chọn quốc gia';

  tags$: Observable<ITagFilmResponse[]>;
  tagGenresFiltered: { value: string; label: string }[] = [];
  tagStudiosFiltered: { value: string; label: string }[] = [];
  tagScheduleFiltered: { value: string; label: string }[] = [];
  tagNationalFiltered: { value: string; label: string }[] = [];

  @Output() close = new EventEmitter<void>();
  @ViewChild('popupContainer') popupContainer!: ElementRef;

  constructor(
    private store: Store,
    private moviesService: MoviesService,
    private cdr: ChangeDetectorRef
  ) {
    // Lấy opened forms từ store
    this.openedForms$ = this.store.select(selectOpenedForms);
    // Khởi tạo data dựa trên movieInfo ban đầu (nếu movieInfo null thì dùng defaultMovie)
    this.data = this.movieInfo ? { ...this.movieInfo } : { ...defaultMovie };

    this.tags$ = this.store.select(selectTagList);
    this.tags$
      .pipe(
        map((tags) => ({
          genres: tags
            .filter((tag) => tag.type === 'Thể loại')
            .map((tag) => ({ value: tag.id, label: tag.name })),
          studios: tags
            .filter((tag) => tag.type === 'Studio')
            .map((tag) => ({ value: tag.id, label: tag.name })),
          schedule: tags
            .filter((tag) => tag.type === 'Lịch chiếu phim')
            .map((tag) => ({ value: tag.id, label: tag.name })),
          national: tags
            .filter((tag) => tag.type === 'Quốc gia')
            .map((tag) => ({ value: tag.id, label: tag.name })),
        }))
      )
      .subscribe(({ genres, studios, schedule, national }) => {
        this.tagGenresFiltered = genres;
        this.tagStudiosFiltered = studios;
        this.tagScheduleFiltered = schedule;
        this.tagNationalFiltered = national;

        // Cập nhật selected labels nếu movieInfo đã có giá trị
        if (this.data) {
          this.selectedStudioLabel =
            this.tagStudiosFiltered.find(
              (item) => item.value === this.data.studio
            )?.label || 'Chọn studio';
          this.selectedScheduleLabel =
            this.tagScheduleFiltered.find(
              (item) => item.value === this.data.schedule
            )?.label || 'Chọn lịch chiếu';
          this.selectedCountryLabel =
            this.tagNationalFiltered.find(
              (item) => item.value === this.data.country
            )?.label || 'Chọn quốc gia';
          if (this.data.genres && this.data.genres.length) {
            const labels = this.data.genres
              .map(
                (g) =>
                  this.tagGenresFiltered.find((item) => item.value === g)?.label
              )
              .filter((label) => label);
            this.selectedGenreLabel = labels.length
              ? labels.join(', ')
              : 'Chọn thể loại';
          }
        }
      });
  }

  // Thêm biến originalData trong component
  originalData: IMovie = { ...defaultMovie };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['movieInfo'] && changes['movieInfo'].currentValue) {
      this.data = { ...defaultMovie, ...this.movieInfo };
      // Lưu bản sao dữ liệu ban đầu để so sánh sau này
      this.originalData = { ...this.data };

      // Cập nhật các nhãn dropdown như cũ...
      if (this.tagStudiosFiltered.length) {
        this.selectedStudioLabel =
          this.tagStudiosFiltered.find(
            (item) => item.value === this.data.studio
          )?.label || 'Chọn studio';
      }
      if (this.tagScheduleFiltered.length) {
        this.selectedScheduleLabel =
          this.tagScheduleFiltered.find(
            (item) => item.value === this.data.schedule
          )?.label || 'Chọn lịch chiếu';
      }
      if (this.tagNationalFiltered.length) {
        this.selectedCountryLabel =
          this.tagNationalFiltered.find(
            (item) => item.value === this.data.country
          )?.label || 'Chọn quốc gia';
      }
      if (this.tagGenresFiltered.length && this.data.genres.length) {
        const labels = this.data.genres
          .map(
            (g) =>
              this.tagGenresFiltered.find((item) => item.value === g)?.label
          )
          .filter((label) => label);
        this.selectedGenreLabel = labels.length
          ? labels.join(', ')
          : 'Chọn thể loại';
      }
      this.selectedStatusLabel = this.data.status || 'Chọn trạng thái';
      this.selectedReleaseYearLabel =
        this.data.releaseDate || 'Chọn năm phát hành';
    }
  }

  // Hàm so sánh đơn giản dùng JSON.stringify cho mảng
  private arraysEqual(a: any[], b: any[]): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  handlePosterFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.posterFile = input.files[0];
      console.log('Poster file:', this.posterFile);
    }
  }

  // Thêm hàm xử lý tải lên banner file
  handleBannerFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.bannerFile = input.files[0];
      console.log('Banner file:', this.bannerFile);
    }
  }

  processTruncateString(str: string) {
    return truncateString(str, 25);
  }

  // Các handler cho input text
  handleOnChangeTitle(value: string) {
    this.data.title = value;
  }
  handleOnChangeDescription(value: string) {
    this.data.description = value;
  }
  handleOnChangeTrailer(value: string) {
    this.data.trailer = value;
  }

  handleSelectStudio(selected: IOptionDropType | IOptionDropType[]) {
    const studio = Array.isArray(selected)
      ? selected[0]?.label || ''
      : selected.label;
    this.selectedStudioLabel = Array.isArray(selected)
      ? selected[0]?.label || ''
      : selected.label;
    // Gán trực tiếp giá trị (value)
    this.data.studio = studio;
    console.log(this.data);
  }

  handleSelectSchedule(selected: IOptionDropType | IOptionDropType[]) {
    const schedule = Array.isArray(selected)
      ? selected[0]?.label || ''
      : selected.label;
    this.selectedScheduleLabel = Array.isArray(selected)
      ? selected[0]?.label || ''
      : selected.label;
    this.data.schedule = schedule;
    console.log(this.data);
  }

  handleSelectGenre(selected: IOptionDropType | IOptionDropType[]) {
    if (Array.isArray(selected)) {
      this.selectedGenreLabel = selected.map((opt) => opt.label).join(', ');
      // Lưu mảng giá trị (value)
      this.data.genres = selected.map((opt) => opt.label);
    } else {
      this.selectedGenreLabel = selected.label;
      this.data.genres = [selected.label];
    }
    console.log(this.data);
  }

  handleSelectCountry(selected: IOptionDropType | IOptionDropType[]) {
    const country = Array.isArray(selected)
      ? selected[0]?.label || ''
      : selected.label;
    this.selectedCountryLabel = Array.isArray(selected)
      ? selected[0]?.label || ''
      : selected.label;
    this.data.country = country;
    console.log(this.data);
  }

  validateInput() {
    this.shouldValidate = false;
    setTimeout(() => {
      this.shouldValidate = true;
    });
  }

  handleValidationResult(isValid: boolean) {
    console.log(isValid ? 'Input hợp lệ ✅' : 'Input không hợp lệ ❌');
  }

  onFormSubmit() {
    this.validateInput();

    // Tạo payload chỉ chứa các trường thay đổi
    const movieUpdate: IMovieUpdate = {};

    if (this.data.title !== this.originalData.title) {
      movieUpdate.title = this.data.title;
    }
    if (this.data.description !== this.originalData.description) {
      movieUpdate.description = this.data.description;
    }
    // Giả sử releaseDate là chuỗi chứa năm, chuyển thành số:
    if (this.data.releaseDate !== this.originalData.releaseDate) {
      movieUpdate.releaseYear = Number(this.data.releaseDate) || 0;
    }
    if (this.data.trailer !== this.originalData.trailer) {
      movieUpdate.trailerUrl = this.data.trailer;
    }
    if (this.data.status !== this.originalData.status) {
      movieUpdate.statusNames = [this.data.status];
    }
    if (this.data.studio !== this.originalData.studio) {
      movieUpdate.studioNames = [this.data.studio];
    }
    if (this.data.schedule !== this.originalData.schedule) {
      movieUpdate.scheduleNames = [this.data.schedule];
    }
    // So sánh mảng genres
    if (!this.arraysEqual(this.data.genres, this.originalData.genres)) {
      movieUpdate.genreNames = this.data.genres;
    }
    if (this.data.country !== this.originalData.country) {
      movieUpdate.countryNames = [this.data.country];
    }

    // Nếu có file mới được chọn, gửi luôn (giả sử nếu file có giá trị, đó là thay đổi)
    if (this.posterFile) {
      movieUpdate.posterFile = this.posterFile;
    }
    if (this.bannerFile) {
      movieUpdate.bannerFile = this.bannerFile;
    }

    // Các trường không có trong IMovie, gán mặc định nếu cần
    // movieUpdate.director = '';
    // movieUpdate.expectedEpisodes = 0;
    // movieUpdate.seriesOrder = '';
    // movieUpdate.movieTypes = [];
    // movieUpdate.releaseYearNames = [];

    console.log('Payload:', movieUpdate);
    this.loading = true;
    this.moviesService.updateAnime(this.animeId, movieUpdate).subscribe({
      next: (res) => this.handleUpdateSuccess(res),
      error: (err) => {
        console.log('Cập nhật thất bại', err);
        this.loading = false;
      },
    });
  }

  private handleUpdateSuccess(response: any) {
    this.loading = false;
    console.log('Cập nhật thành công:', response);
    sendNotification(this.store, 'Thành công', response.message, 'success');
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    this.closePopup();
  }

  closePopup() {
    this.store.dispatch(closeForm({ formType: 'update-anime' }));
    this.loading = false;
  }

  closePopupOnOutside(event: Event) {
    if (
      this.popupContainer &&
      !this.popupContainer.nativeElement.contains(event.target)
    ) {
      this.closePopup();
    }
  }
}
