import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { selectOpenedForms } from '../../../store/open-form-state/form.selectors';
import { selectNotifications } from '../../../store/notification/notification.selector';
import {
  closeForm,
  openForm,
} from '../../../store/open-form-state/form.actions';
import {
  IDataCreateEpisodePending,
  INotification,
} from '../../../models/InterfaceData';
import { filter, Observable } from 'rxjs';
import { addNotification } from '../../../store/notification/notification.action';
import { InteractiveButtonComponent } from '../../regular/button/button.component';
import { DynamicInputComponent } from '../../regular/input/input.component';
import { CommonModule } from '@angular/common';
import { MoviesService } from '../../../services/api-service/movies.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { sendNotification } from '../../../utils/notification';

@Component({
  selector: 'app-create-episode-form',
  imports: [InteractiveButtonComponent, DynamicInputComponent, CommonModule],
  templateUrl: './create-episode-form.component.html',
  styleUrl: './create-episode-form.component.scss',
})
export class CreateEpisodeFormComponent {
  @Input() animeId: string | null = '';
  @Output() close = new EventEmitter<void>();
  @ViewChild('popupContainer') popupContainer!: ElementRef;

  openedForms$: Observable<{ [key: string]: boolean }>;
  shouldValidate = false;
  loading = false;

  data: IDataCreateEpisodePending = {
    animeId: '',
    selectedFile: null,
    selectedDate: '',
    summary: '',
    episodeNumber: '',
  };

  notifications$: Observable<INotification[]>;

  constructor(
    private store: Store,
    private router: Router,
    private movieService: MoviesService,
    private route: ActivatedRoute
  ) {
    this.openedForms$ = this.store.select(selectOpenedForms);
    this.notifications$ = this.store.select(selectNotifications);
  }

  ngOnInit() {
    // this.router.events
    //   .pipe(
    //     filter(
    //       (event) =>
    //         event instanceof NavigationEnd &&
    //         event.urlAfterRedirects.startsWith('/film-details/')
    //     )
    //   )
    //   .subscribe(() => {
    //     let route = this.route;
    //     // Duyệt vào route con nếu có (trường hợp route lồng nhau)
    //     while (route.firstChild) {
    //       route = route.firstChild;
    //     }
    //     this.data.animeId = route.snapshot.paramMap.get('id') ?? '';
    //     console.log('ID cập nhật:', this.data.animeId);
    //   });
    this.data.animeId = this.animeId ?? '';
  }

  handleOnChangeSummary(u: string) {
    this.data.summary = u;
  }

  handleOnChangeEpisodeNumber(p: string) {
    this.data.episodeNumber = p;
  }

  validateInput() {
    this.shouldValidate = false;
    setTimeout(() => {
      this.shouldValidate = true;
    });
  }

  handleValidationResult(isValid: boolean) {
    if (isValid) {
      console.log('Input hợp lệ ✅');
    } else {
      console.log('Input không hợp lệ ❌');
    }
  }

  onFormSubmit() {
    this.validateInput();
    console.log(this.data);
    // Chờ một chút để validation chạy xong
    setTimeout(() => {
      if (
        this.data.summary &&
        this.data.episodeNumber &&
        this.data.episodeNumber &&
        this.data.selectedFile
      ) {
        this.loading = true; // Bật loading
        console.log(this.data);
        this.movieService
          .createEpisodePending(
            this.data.animeId,
            this.data.episodeNumber,
            this.data.summary,
            this.data.selectedFile,
            this.data.selectedDate
          )
          .subscribe({
            next: (response) => {
              console.log('Thêm mới Anime thành công:', response);
              sendNotification(
                this.store,
                'Tạo mới thành công',
                response.message,
                'success'
              );
              this.loading = false;
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            },
            error: (err) => {
              this.loading = false;
              console.log(err);
            },
          });
      } else {
        console.log('Vui lòng nhập đầy đủ thông tin');
        const notification: INotification = {
          id: Date.now().toString(),
          title: 'Cần đủ thông tin!',
          message: 'Vui lòng nhập đầy đủ thông tin',
          type: 'info',
          timestamp: new Date(),
        };
        this.loading = false;
        this.store.dispatch(addNotification({ notification }));
      }
    }, 100);
  }

  // Xử lý drag & drop file mp4
  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'video/mp4') {
        this.data.selectedFile = file;
        // Có thể xử lý upload file ở đây
      } else {
        // Thông báo lỗi nếu file không phải mp4
        console.error('File không đúng định dạng mp4.');
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type === 'video/mp4') {
        this.data.selectedFile = file;
        // Xử lý upload file nếu cần
      } else {
        console.error('File không đúng định dạng mp4.');
      }
    }
  }

  // Xử lý input date, giá trị trả về định dạng YYYY-MM-DD
  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const dateValue = input.value; // Lấy giá trị "YYYY-MM-DD"
    // Lấy thời gian hiện tại
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    // Kết hợp thành chuỗi theo format ISO
    const isoDateTime = `${dateValue}T${hours}:${minutes}:${seconds}`;
    this.data.selectedDate = isoDateTime;
    console.log('Ngày được chọn:', this.data.selectedDate);
  }

  closePopup() {
    if (this.loading) {
      return;
    }
    this.store.dispatch(closeForm({ formType: 'create-episode' }));
    this.data = {
      animeId: '',
      selectedFile: null,
      selectedDate: '',
      summary: '',
      episodeNumber: '',
    };
  }

  /** Đóng popup nếu click outside */
  closePopupOnOutside(event: Event) {
    if (this.loading) {
      return;
    }
    if (
      this.popupContainer &&
      !this.popupContainer.nativeElement.contains(event.target)
    ) {
      this.closePopup();
    }
  }
}
