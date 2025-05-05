import { Component, Input, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MoviesService } from '../../../services/api-service/movies.service';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { sendNotification } from '../../../utils/notification';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-episode-approval',
  templateUrl: './episode-approval.component.html',
  styleUrls: ['./episode-approval.component.scss'],
  imports: [FormsModule, CommonModule],
})
export class EpisodeApprovalComponent {
  @Input() episodeId: string | null = null;
  @Input() episodeName: string | null = null;
  @Input() episodeStatus: string | null = null;
  @Input() reasonReject: string = '';
  isEditing = false;
  episodeTitle = '';
  episodeDescription = '';
  approveLoading = false;
  rejectLoading = false;
  reason: string = '';
  role: string = '';

  // Thuộc tính lưu file video chọn (nếu có)
  selectedVideoFile: File | null = null;
  updating: boolean = false;

  constructor(
    private movieService: MoviesService,
    private store: Store,
    private cookiesService: CookieService
  ) {
    this.role = this.cookiesService.get('role');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['episodeId']) {
      console.log('episodeId thay đổi thành:', this.episodeId);
      // Thực hiện các hành động cần thiết khi episodeId thay đổi
    }
    if (changes['episodeName']) {
      console.log('episodeName thay đổi thành:', this.episodeName);
      // Thực hiện các hành động cần thiết khi episodeName thay đổi
    }
  }

  onNotApproved(): void {
    if (this.episodeId && this.reason) {
      this.rejectLoading = true;
      this.movieService.rejectEpisode(this.episodeId, this.reason).subscribe({
        next: (response) => {
          sendNotification(
            this.store,
            'Đã reject tập phim!',
            response.message,
            'success'
          );
          this.rejectLoading = false;
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        },
        error: () => {
          this.rejectLoading = false;
        },
      });
    } else {
      sendNotification(
        this.store,
        'Lỗi!',
        'Có lỗi khi lấy thông tin tập phim hoặc chưa nhập lý do',
        'error'
      );
    }
    console.log('Reject tập với lý do:', this.reason);
  }

  onConfirmApproval(): void {
    if (this.episodeId) {
      this.approveLoading = true;
      this.movieService.approveEpisode(this.episodeId).subscribe({
        next: (response) => {
          sendNotification(
            this.store,
            'Đã duyệt tập phim!',
            response.message,
            'success'
          );
          this.approveLoading = false;
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        },
        error: () => {
          this.approveLoading = false;
        },
      });
    } else {
      sendNotification(
        this.store,
        'Lỗi',
        'Có lỗi khi lấy thông tin tập phim',
        'error'
      );
    }
    console.log('Approve tập');
  }

  onDeleteEpisode(): void {
    if (this.episodeId) {
      this.movieService.deleteEpisode(this.episodeId).subscribe({
        next: (response) => {
          sendNotification(this.store, 'Đã xoá', response.message, 'success');
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        },
        error: (err) => {
          console.log(err);
          sendNotification(
            this.store,
            'Lỗi',
            'Có lỗi xảy ra, không thể xoá!',
            'error'
          );
        },
      });
    }
  }

  toggleEditForm(): void {
    // Gán giá trị hiện tại cho các trường chỉnh sửa
    this.episodeTitle = this.episodeName || '';
    this.episodeDescription = '';
    // Reset file upload khi mở form chỉnh sửa
    this.selectedVideoFile = null;
    this.isEditing = true;
  }

  cancelEdit(): void {
    if (this.updating) {
      return;
    }
    this.isEditing = false;
  }

  // Xử lý khi chọn file từ input
  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedVideoFile = target.files[0];
    }
  }

  // Cập nhật tập phim với dữ liệu chỉnh sửa và file video (nếu có)
  onUpdateEpisode(): void {
    this.updating = true;
    if (!this.episodeId) {
      sendNotification(this.store, 'Lỗi', 'Không có episodeId', 'error');
      this.updating = false;
      return;
    }
    // Gọi API updateEpisode với title, description và file (có thể null)
    this.movieService
      .updateEpisode(
        this.episodeId,
        this.episodeTitle,
        this.episodeDescription,
        this.selectedVideoFile || undefined
      )
      .subscribe({
        next: (res) => {
          sendNotification(
            this.store,
            'Cập nhật thành công!',
            res.message,
            'success'
          );
          this.isEditing = false;
          this.updating = false;
          // Reload trang hoặc cập nhật giao diện theo nhu cầu
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        },
        error: (err) => {
          console.log(err);
          sendNotification(this.store, 'Lỗi', 'Không thể cập nhật', 'error');
          this.updating = false;
        },
      });
  }
}
