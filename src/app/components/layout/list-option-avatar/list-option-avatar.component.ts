import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ILocalData,
  ILocalWatchlistData,
  IOptionItem,
} from '../../../models/InterfaceData';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectOpenedForms } from '../../../store/open-form-state/form.selectors';
import { openForm } from '../../../store/open-form-state/form.actions';
import { selectIsAuthenticated } from '../../../store/auth/auth.selectors';
import { Router } from '@angular/router';
import { MoviesService } from '../../../services/api-service/movies.service';
import { sendNotification } from '../../../utils/notification';

@Component({
  selector: 'app-list-option-avatar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-option-avatar.component.html',
  styleUrl: './list-option-avatar.component.scss',
})
export class ListOptionAvatarComponent {
  isOpenLogin$: Observable<{ [key: string]: boolean }>;
  isAuthenticated$: Observable<boolean>;
  constructor(
    private sanitizer: DomSanitizer,
    private store: Store,
    private router: Router,
    private movideService: MoviesService
  ) {
    this.isOpenLogin$ = this.store.select(selectOpenedForms);
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
  }

  @Input() options: IOptionItem[] = [];
  @Output() optionSelected = new EventEmitter<IOptionItem>();
  @Output() showLoginForm = new EventEmitter<void>(); // Thêm sự kiện để hiển thị form
  @Output() showRegisterForm = new EventEmitter<void>(); // Thêm sự kiện để hiển thị form
  @Output() showRegisterModeratorForm = new EventEmitter<void>();

  selectOption(option: IOptionItem): void {
    if (option.id === 1) {
      this.showLoginForm.emit(); // Kích hoạt sự kiện hiển thị form khi id = 1
      this.store.dispatch(openForm({ formType: 'login' }));
    }
    if (option.id === 2) {
      this.showRegisterForm.emit();
      this.store.dispatch(openForm({ formType: 'register' }));
    }
    if (option.id === 3) {
      this.showRegisterModeratorForm.emit();
      this.store.dispatch(openForm({ formType: 'reg-moderator' }));
    }
    if (option.id === 4) {
      this.showRegisterForm.emit();
      this.store.dispatch(openForm({ formType: 'modal-warning' }));
    }
    if (option.id === 5) {
      this.router.navigate(['/profile']);
    }
    if (option.id === 6) {
      this.showRegisterForm.emit();
      this.store.dispatch(openForm({ formType: 'update-password' }));
    }
    if (option.id === 7) {
      this.syncViewHistory();
    }
    if (option.id === 8) {
      this.syncLocalWatchList();
    }
    if (option.id === 9) {
      this.router.navigate(['/service-and-payment']);
    }
    if (option.id === 10) {
      this.router.navigate(['/statistic-dashboard']);
    }
    // this.optionSelected.emit(option);
  }

  syncViewHistory() {
    const localDataString = localStorage.getItem('viewHistory');
    let localData: ILocalData | null = null;
    if (localDataString) {
      localData = JSON.parse(localDataString) as ILocalData;

      // Loại bỏ các đối tượng có episodeId là chuỗi rỗng
      localData.localData = localData.localData.filter(
        (item) => item.episodeId.trim() !== ''
      );

      if (localData.localData.length > 0) {
        this.movideService.syncLocalHistory(localData).subscribe({
          next: (res) => {
            sendNotification(
              this.store,
              'Đồng bộ thành công!',
              res.message,
              'success'
            );
            localStorage.removeItem('viewHistory');
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          },
          error: (err) => {
            console.log(err);
          },
        });
      } else {
        sendNotification(
          this.store,
          'Đồng bộ thất bại!',
          'Không có dữ liệu tập phim để đồng bộ.',
          'error'
        );
      }
    } else {
      sendNotification(
        this.store,
        'Đồng bộ thất bại!',
        'Không có dữ liệu tập phim để đồng bộ.',
        'error'
      );
    }
  }

  syncLocalWatchList() {
    const localDataString = localStorage.getItem('watchlist');
    let localData: ILocalWatchlistData | null = null;
    if (localDataString) {
      localData = JSON.parse(localDataString) as ILocalWatchlistData;

      // Loại bỏ các đối tượng có episodeId là chuỗi rỗng
      localData.localWatchlistData = localData.localWatchlistData.filter(
        (item) => item.animeId.trim() !== ''
      );

      if (localData.localWatchlistData.length > 0) {
        this.movideService.syncLocalWatchlist(localData).subscribe({
          next: (res) => {
            sendNotification(
              this.store,
              'Đồng bộ thành công!',
              res.message,
              'success'
            );
            localStorage.removeItem('watchlist');
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          },
          error: (err) => {
            console.log(err);
          },
        });
      } else {
        sendNotification(
          this.store,
          'Đồng bộ thất bại!',
          'Không có dữ liệu phim đã lưu.',
          'error'
        );
      }
    } else {
      sendNotification(
        this.store,
        'Đồng bộ thất bại!',
        'Không có dữ liệu phim để đồng bộ.',
        'error'
      );
    }
  }

  trackById(index: number, option: IOptionItem): number | string {
    return option.id;
  }

  sanitizeIcon(icon: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(icon);
  }
}
