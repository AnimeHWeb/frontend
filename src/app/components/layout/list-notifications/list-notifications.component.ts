import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  ElementRef,
  HostListener,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { INotice } from '../../../models/InterfaceData';
import { parse, formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { NoticeService } from '../../../services/api-service/notice.service';
import { WebSocketService } from '../../../services/api-service/websocket.service';

interface FormattedNotice extends INotice {
  timeAgo: string;
}

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-notifications.component.html',
  styleUrls: ['./list-notifications.component.scss'],
})
export class NotificationListComponent implements OnInit, OnChanges {
  // Danh sách thông báo đã fetch
  notices: INotice[] = [];
  formattedNotices: FormattedNotice[] = [];
  isVisible: boolean = false;
  error: string = '';
  loading: boolean = false;

  // Phân trang
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 10;
  totalElements: number | null = null;

  // Để tránh gọi quá nhiều lần khi cuộn
  isFetching: boolean = false;

  // Mảng wsNotifications để lưu thông báo nhận từ WebSocket
  wsNotifications: any[] = [];

  // Lấy tham chiếu đến container để bắt sự kiện scroll
  @ViewChild('notificationContainer', { static: true })
  notificationContainer!: ElementRef;

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isVisible = false;
    }
  }

  constructor(
    private eRef: ElementRef,
    private noticeService: NoticeService,
    private wsService: WebSocketService // Inject WebSocketService
  ) {}

  ngOnInit(): void {
    this.fetchNotifications(1);

    // Kết nối WebSocket và subscribe nhận thông báo
    this.wsService.connect();
    this.wsService.allNotifications$.subscribe(({ topic, data }) => {
      console.log(`Received from ${topic}:`, data);
      // Xử lý thông báo chung hoặc phân loại theo topic
      this.fetchNotifications(1);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['notices']) {
      this.updateFormattedNotices();
    }
  }

  // Fetch thông báo của trang được chỉ định và nối vào danh sách hiện có
  fetchNotifications(page: number): void {
    this.loading = true;
    this.isFetching = true;
    this.noticeService.countCurrentUnreadNotifications().subscribe((res) => {
      this.totalElements = res.result;
    });

    this.noticeService
      .getCurrentNotifications(page - 1, this.pageSize)
      .subscribe({
        next: (response) => {
          const pageResult = response.result;
          // Nối thêm thông báo mới
          this.notices = [...this.notices, ...pageResult.content];
          // Cập nhật trang hiện tại và tổng số trang
          this.currentPage = pageResult.number + 1;
          this.totalPages = pageResult.totalPages;
          this.updateFormattedNotices();
          this.loading = false;
          this.isFetching = false;
        },
        error: (err) => {
          console.error('Error fetching notifications:', err);
          this.error = 'Lỗi khi tải thông báo.';
          this.loading = false;
          this.isFetching = false;
        },
      });
  }

  // Cập nhật danh sách formattedNotices dựa trên notices
  updateFormattedNotices(): void {
    this.formattedNotices = this.notices.map((notice) => ({
      ...notice,
      // Sử dụng new Date() để parse ISO string (nếu API trả về ISO)
      timeAgo: formatDistanceToNow(new Date(notice.time), {
        addSuffix: true,
        locale: vi,
      }),
    }));
  }

  // Hàm toggle hiển thị danh sách thông báo
  toggleNotification(): void {
    this.isVisible = !this.isVisible;
  }

  // Đánh dấu thông báo đã đọc
  markAsRead(notice: FormattedNotice): void {
    notice.isRead = true;
    this.updateFormattedNotices();
  }

  // Đánh dấu tất cả đã đọc
  markAllAsRead(): void {
    // Lấy danh sách các ID của thông báo chưa đọc
    const unreadIds = this.notices
      .filter((notice) => !notice.isRead)
      .map((notice) => notice.id);

    // Cập nhật trạng thái trong local array
    this.notices.forEach((notice) => (notice.isRead = true));
    this.updateFormattedNotices();

    // Gọi API để đánh dấu nhiều thông báo đã đọc
    if (unreadIds.length > 0) {
      this.noticeService.markAsReadMultiple(unreadIds).subscribe({
        next: (res) => {
          console.log('Marked as read:', res);
          // Có thể hiển thị thông báo thành công nếu cần
          this.totalElements = this.totalElements
            ? this.totalElements - unreadIds.length
            : this.totalElements;
        },
        error: (err) => {
          console.error('Error marking notifications as read:', err);
          // Thông báo lỗi nếu cần
        },
      });
    }
  }

  // Khi cuộn trong container thông báo
  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    // Kiểm tra nếu đã cuộn đến gần cuối (ví dụ cách dưới 10px)
    if (
      element.scrollTop + element.clientHeight >= element.scrollHeight - 10 &&
      !this.isFetching &&
      this.currentPage < this.totalPages
    ) {
      // Fetch trang tiếp theo
      this.fetchNotifications(this.currentPage + 1);
    }
  }

  // trackBy để tối ưu hiển thị danh sách
  trackByNoticeId(index: number, notice: FormattedNotice): string {
    return notice.id;
  }
}
