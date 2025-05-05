import { Component, EventEmitter, Output } from '@angular/core';
import { SERVER_RESPONSE } from '../../../models/ApiResponse';
import { MoviesService } from '../../../services/api-service/movies.service';
import { Store } from '@ngrx/store';
import {
  ICreateAnimePendingResponse,
  ITagFilmResponse,
} from '../../../models/InterfaceResponse';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { selectTagList } from '../../../store/tag-film/tag-film.selector';
import { map, Observable } from 'rxjs';
import { DropdownButtonComponent } from '../../regular/dropdown/dropdown.component';
import { sendNotification } from '../../../utils/notification';

@Component({
  selector: 'app-create-anime-pending',
  imports: [CommonModule, FormsModule, DropdownButtonComponent],
  templateUrl: './create-anime-pending.component.html',
  styleUrl: './create-anime-pending.component.scss',
})
export class CreateAnimePendingComponent {
  @Output() closeForm = new EventEmitter<void>();

  activeDropdown: string | null = null;
  seriesId = '';
  newAnimeTitle = '';
  newAnimeDescription = '';
  expectedEpisodes: number | null = null;
  linkTrailer: string = '';
  typeIds: string[] | null = null;
  selectedBanner: File | null = null;
  selectedPoster: File | null = null;
  bannerPreview: string | null = null;
  posterPreview: string | null = null;
  isLoading = false;
  tags$: Observable<ITagFilmResponse[]>;
  tagGenresFiltered: { value: string; label: string }[] = [];
  tagStudiosFiltered: { value: string; label: string }[] = [];
  tagScheduleFiltered: { value: string; label: string }[] = [];
  tagNationalFiltered: { value: string; label: string }[] = [];
  selectedOptions: { [key: string]: any } = {};
  series: { value: string; label: string }[] = [];
  date: string = '';

  constructor(private moviesService: MoviesService, private store: Store) {
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
      });
  }

  ngOnInit() {
    this.moviesService.getAllSeries().subscribe({
      next: (res) => {
        this.series = res.result.map((series) => ({
          value: series.id,
          label: series.title,
        }));
      },
    });
  }

  toggleDropdown(id: string): void {
    // this.activeDropdownId = this.activeDropdownId === id ? null : id; //để chọn nhiều option từ các dropdown
    this.activeDropdown = this.activeDropdown === id ? null : id;
  }

  handleSelect(dropdownKey: string, selected: any): void {
    this.selectedOptions[dropdownKey] = selected;
    console.log(selected);

    if (dropdownKey === 'series') {
      this.updateSeries(); // Cập nhật seriesId khi chọn series
    } else {
      this.updateTypeIds(); // Cập nhật typeIds cho genre & studio
    }
  }

  // Xử lý input date, giá trị trả về định dạng YYYY-MM-DD
  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const dateValue = input.value; // Lấy giá trị "YYYY-MM-DD"
    const isoDateTime = `${dateValue}`;
    this.date = isoDateTime;
    console.log('Ngày được chọn:', this.date);
  }

  // TO UPDATE: Thêm type vào đây
  updateTypeIds() {
    let genres = this.selectedOptions['genre'] || [];
    let studios = this.selectedOptions['studio'] || [];
    let national = this.selectedOptions['national'] || [];

    // Nếu genre/studio là object (vì dropdown 1 lựa chọn), convert sang mảng 1 phần tử
    if (genres && !Array.isArray(genres)) {
      genres = [genres];
    }
    if (studios && !Array.isArray(studios)) {
      studios = [studios];
    }
    if (national && !Array.isArray(national)) {
      national = [national];
    }

    // Bây giờ genres & studios đã là array hoặc []
    this.typeIds = [
      ...genres.map((item: { value: string }) => item.value),
      ...studios.map((item: { value: string }) => item.value),
      ...national.map((item: { value: string }) => item.value),
    ];
    console.log('Danh sách typeIds:', this.typeIds);
  }

  updateSeries() {
    const selectedSeries = this.selectedOptions['series']; // Lấy series đã chọn
    this.seriesId = selectedSeries.value || null;
    console.log('Series ID:', this.seriesId);
  }

  onFileSelected(event: Event, type: 'banner' | 'poster') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        if (type === 'banner') {
          this.selectedBanner = file;
          this.bannerPreview = e.target.result;
        } else if (type === 'poster') {
          this.selectedPoster = file;
          this.posterPreview = e.target.result;
        }
      };

      reader.readAsDataURL(file);
    }
  }

  submit() {
    if (!this.newAnimeTitle || !this.expectedEpisodes) {
      sendNotification(
        this.store,
        'Cảnh báo!',
        'Tên phim và số tập bắt buộc',
        'warning'
      );
      return;
    }

    this.isLoading = true;

    this.moviesService
      .createAnimePending(
        this.seriesId,
        this.newAnimeTitle,
        this.newAnimeDescription,
        this.expectedEpisodes,
        this.linkTrailer,
        this.typeIds,
        this.date,
        this.selectedPoster,
        this.selectedBanner
      )
      .subscribe({
        next: (res) => {
          this.handleSuccess(res);
          this.resetForm();
          this.closeForm.emit();
        },
        error: (err) => {
          console.error('Lỗi API:', err);
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  private handleSuccess(
    response: SERVER_RESPONSE<ICreateAnimePendingResponse>
  ) {
    this.isLoading = false;
    console.log('Thêm mới Anime thành công:', response);
    sendNotification(this.store, 'Thành công!', response.message, 'success');
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  resetForm() {
    this.seriesId = '';
    this.newAnimeTitle = '';
    this.newAnimeDescription = '';
    this.date = '';
    this.typeIds = [];
    this.selectedBanner = null;
    this.selectedPoster = null;
    this.bannerPreview = null;
    this.posterPreview = null;
  }

  cancel() {
    if (!this.isLoading) this.closeForm.emit();
  }
}
