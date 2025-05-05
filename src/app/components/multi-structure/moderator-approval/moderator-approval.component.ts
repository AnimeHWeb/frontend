import { Component, Input } from '@angular/core';
import { INotification } from '../../../models/InterfaceData';
import { addNotification } from '../../../store/notification/notification.action';
import { MoviesService } from '../../../services/api-service/movies.service';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { sendNotification } from '../../../utils/notification';
import { AuthService } from '../../../services/api-service/auth.service';

@Component({
  selector: 'app-moderator-approval',
  imports: [CommonModule, FormsModule],
  templateUrl: './moderator-approval.component.html',
  styleUrl: './moderator-approval.component.scss',
})
export class ModeratorApprovalComponent {
  @Input() requestId: string | null = null;
  approveLoading = false;
  rejectLoading = false;
  reason: string = '';

  constructor(private authService: AuthService, private store: Store) {}

  onNotApproved(): void {
    this.rejectLoading = true;
    if (this.reason && this.requestId) {
      this.authService
        .rejectModeratorRequest(this.reason, this.requestId)
        .subscribe({
          next: (res) => {
            sendNotification(
              this.store,
              'Đã từ chối yêu cầu!',
              res.message,
              'success'
            );
            this.rejectLoading = false;
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          },
          error: (err) => {
            console.log(err);
            this.rejectLoading = false;
          },
        });
    } else {
      sendNotification(
        this.store,
        'Lỗi!',
        'Có lỗi khi lấy mã Request hoặc chưa nhập lý do',
        'error'
      );
      this.rejectLoading = false;
    }
    console.log('Không đạt:', this.reason);
  }

  onConfirmApproval(): void {
    if (this.requestId) {
      this.authService.approveModeratorRequest(this.requestId).subscribe({
        next: (res) => {
          sendNotification(this.store, 'Đã duyệt!', res.message, 'success');
          this.rejectLoading = false;
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        },
        error: (err) => {
          console.log(err);
          this.rejectLoading = false;
        },
      });
    } else {
      sendNotification(
        this.store,
        'Lỗi!',
        'Có lỗi khi lấy mã Request',
        'error'
      );
      this.rejectLoading = false;
    }
    console.log('Xác nhận duyệt:');
  }
}
