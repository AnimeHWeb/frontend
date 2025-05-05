import { Component, EventEmitter, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ICreateTagType, INotification } from '../../../models/InterfaceData';
import { MoviesService } from '../../../services/api-service/movies.service';
import { CommonModule } from '@angular/common';
import { addNotification } from '../../../store/notification/notification.action';
import { Store } from '@ngrx/store';
import { sendNotification } from '../../../utils/notification';

@Component({
  selector: 'app-create-tag',
  templateUrl: './create-tag.component.html',
  styleUrls: ['./create-tag.component.scss'],
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
})
export class CreateTagComponent {
  @Output() cancel = new EventEmitter<void>();

  tagForm: FormGroup;
  isSubmitting = false;
  message: string = '';
  selectedTag: string = '';
  isDropdownOpen = false;
  tagTypes = [
    'Loại phim',
    'Tình trạng',
    'Thể loại',
    'Lịch chiếu',
    'Studio',
    'Năm phát hành',
    'Quốc gia',
  ];

  constructor(
    private fb: FormBuilder,
    private movieService: MoviesService,
    private store: Store
  ) {
    this.tagForm = this.fb.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectOption(type: string, event: Event) {
    event.stopPropagation(); // Ngăn chặn sự kiện click lan truyền lên select-wrapper
    this.selectedTag = type;
    this.tagForm.patchValue({ type });

    // Đóng dropdown sau một khoảng thời gian ngắn để tránh lỗi UI chưa cập nhật kịp
    setTimeout(() => {
      this.isDropdownOpen = false;
    }, 100);
  }

  createTag() {
    if (this.tagForm.invalid) {
      this.message = 'Vui lòng nhập đầy đủ thông tin!';
      return;
    }

    this.isSubmitting = true;
    this.message = '';

    const tagData: ICreateTagType = this.tagForm.value;
    this.movieService.createType(tagData).subscribe({
      next: (response) => {
        sendNotification(
          this.store,
          'Đã thêm mới tag!',
          response.message,
          'success'
        );
        this.tagForm.reset();
        this.isSubmitting = false;
      },
      error: () => {
        this.message = 'Lỗi khi tạo tag, vui lòng thử lại!';
        this.isSubmitting = false;
      },
      complete: () => (this.isSubmitting = false),
    });
  }

  onCancel() {
    this.cancel.emit();
  }
}
