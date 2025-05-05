import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MoviesService } from '../../../services/api-service/movies.service';
import { INotification } from '../../../models/InterfaceData';
import { addNotification } from '../../../store/notification/notification.action';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { sendNotification } from '../../../utils/notification';
import { Router } from '@angular/router';

@Component({
  selector: 'app-film-approval',
  templateUrl: './film-approval.component.html',
  styleUrls: ['./film-approval.component.scss'],
  imports: [FormsModule, CommonModule],
})
export class FilmApprovalComponent {
  @Input() animeId: string | null = null;
  approveLoading = false;
  rejectLoading = false;
  reason: string = '';

  constructor(
    private movieService: MoviesService,
    private store: Store,
    private router: Router
  ) {}

  onNotApproved(): void {
    if (this.animeId && this.reason) {
      this.rejectLoading = true;
      this.movieService.rejectAnime(this.animeId, this.reason).subscribe({
        next: (response) => {
          sendNotification(
            this.store,
            'Đã reject Anime!',
            response.message,
            'success'
          );
          this.rejectLoading = false;
          setTimeout(() => {
            this.router.navigate(['/movie-approval']);
          }, 2000);
        },
        error: () => {
          this.rejectLoading = false;
        },
      });
    } else {
      sendNotification(
        this.store,
        'Lỗi',
        'Có lỗi khi xác thực Anime hoặc chưa nhập lý do',
        'error'
      );
    }
    console.log('Không đạt:', this.reason);
  }

  onConfirmApproval(): void {
    if (this.animeId) {
      this.approveLoading = true;
      this.movieService.approveAnime(this.animeId).subscribe({
        next: (response) => {
          const notification: INotification = {
            id: Date.now().toString(),
            title: 'Đã duyệt phim!',
            message: response.message,
            type: 'success',
            timestamp: new Date(),
          };
          this.store.dispatch(addNotification({ notification }));
          this.approveLoading = false;
          setTimeout(() => {
            this.router.navigate(['/movie-approval']);
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
        'Có lỗi xảy ra khi lấy mã Anime',
        'error'
      );
    }
    console.log('Xác nhận duyệt:');
  }
}
