import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MoviesService } from '../../../services/api-service/movies.service';
import { SERVER_RESPONSE } from '../../../models/ApiResponse';
import { INotification } from '../../../models/InterfaceData';
import { addNotification } from '../../../store/notification/notification.action';
import { Store } from '@ngrx/store';
import { sendNotification } from '../../../utils/notification';

@Component({
  selector: 'app-add-series',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-series.component.html',
  styleUrl: './add-series.component.scss',
})
export class AddSeriesComponent {
  @Output() closeForm = new EventEmitter<void>();

  newSeriesTitle = '';
  newSeriesDescription = '';
  selectedBanner: File | null = null;
  selectedPoster: File | null = null;
  bannerPreview: string | null = null;
  posterPreview: string | null = null;
  isLoading = false; // Trạng thái loading

  constructor(private moviesService: MoviesService, private store: Store) {}

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
    if (
      !this.newSeriesTitle ||
      !this.newSeriesDescription ||
      !this.selectedBanner ||
      !this.selectedPoster
    ) {
      sendNotification(
        this.store,
        'Cảnh báo!',
        'Vui lòng nhập đủ các thông tin',
        'warning'
      );
      return;
    }

    this.isLoading = true; // Bắt đầu loading

    this.moviesService
      .createSeries(
        this.newSeriesTitle,
        this.newSeriesDescription,
        this.selectedBanner!,
        this.selectedPoster!
      )
      .subscribe({
        next: (res) => {
          this.handleAddSeriesSuccess(res);
          this.resetForm();
          this.closeForm.emit();
        },
        error: (err) => {
          console.error('Lỗi API:', err);
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false; // Kết thúc loading
        },
      });
  }

  private handleAddSeriesSuccess(response: SERVER_RESPONSE<null>) {
    this.isLoading = false; // Kết thúc loading
    // Tắt loading
    console.log('Thêm mới Series thành công:', response);
    sendNotification(
      this.store,
      'Thêm series thành công!',
      response.message,
      'success'
    );
  }

  resetForm() {
    this.newSeriesTitle = '';
    this.newSeriesDescription = '';
    this.selectedBanner = null;
    this.selectedPoster = null;
    this.bannerPreview = null;
    this.posterPreview = null;
  }

  cancel() {
    if (!this.isLoading) this.closeForm.emit();
  }
}
