import {
  Component,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { selectOpenedForms } from '../../../store/open-form-state/form.selectors';
import { closeForm } from '../../../store/open-form-state/form.actions';
import { InteractiveButtonComponent } from '../../regular/button/button.component';
import { DynamicInputComponent } from '../../regular/input/input.component';
import { AuthService } from '../../../services/api-service/auth.service';
import { SERVER_RESPONSE } from '../../../models/ApiResponse';
import { selectNotifications } from '../../../store/notification/notification.selector';
import { INotification } from '../../../models/InterfaceData';
import { sendNotification } from '../../../utils/notification';

export interface IUpdatePassword {
  oldPassword: string;
  newPassword: string;
}

@Component({
  selector: 'app-update-password',
  imports: [
    CommonModule,
    FormsModule,
    InteractiveButtonComponent,
    DynamicInputComponent,
  ],
  templateUrl: './update-password.component.html',
  styleUrl: './update-password.component.scss',
})
export class UpdatePasswordComponent {
  openedForms$: Observable<{ [key: string]: boolean }>;
  shouldValidate = false;
  loading = false;
  data: IUpdatePassword = {
    oldPassword: '',
    newPassword: '',
  };
  confirmPassword: string = '';

  notifications$: Observable<INotification[]>;

  @Output() close = new EventEmitter<void>();
  @ViewChild('popupContainer') popupContainer!: ElementRef;

  constructor(private store: Store, private authService: AuthService) {
    this.openedForms$ = this.store.select(selectOpenedForms);
    this.notifications$ = this.store.select(selectNotifications);
  }

  handleOnChangeOldPassword(o: string) {
    this.data.oldPassword = o;
  }

  handleOnChangeNewPassWord(n: string) {
    this.data.newPassword = n;
  }

  handleOnChangeConfirmPassWord(c: string) {
    this.confirmPassword = c;
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

  /** Xử lý đăng nhập */
  onFormSubmit() {
    this.validateInput();
    if (this.data.newPassword !== this.confirmPassword) {
      sendNotification(
        this.store,
        'Mật khẩu sai',
        'Mật khẩu nhập lại của bạn không khớp.',
        'error'
      );
      return;
    }
    // Chờ một chút để validation chạy xong
    setTimeout(() => {
      if (this.data.oldPassword && this.data.newPassword) {
        this.loading = true; // Bật loading
        const dataUpdatePassword: IUpdatePassword = {
          oldPassword: this.data.oldPassword,
          newPassword: this.data.newPassword,
        };
        this.authService.updateUserPassword(dataUpdatePassword).subscribe({
          next: (response) => {
            this.handleUpdatePasswordSuccess(response);
          },
          error: (error) => {
            console.log('Lỗi từ API:', error);
            this.loading = false;
          },
        });
      } else {
        console.log('Vui lòng nhập đầy đủ thông tin đăng nhập');
      }
    }, 100);
  }

  /** Xử lý khi đăng nhập thành công */
  private handleUpdatePasswordSuccess(response: SERVER_RESPONSE<null>) {
    this.loading = false; // Tắt loading
    console.log('Đăng nhập thành công:', response);
    sendNotification(this.store, 'Thành công!', response.message, 'success');
    // Xử lý lưu token hoặc thông tin user
    this.closePopup();
  }

  closePopup() {
    this.store.dispatch(closeForm({ formType: 'update-password' }));
    this.data = {
      oldPassword: '',
      newPassword: '',
    };
  }

  /** Đóng popup nếu click outside */
  closePopupOnOutside(event: Event) {
    if (
      this.popupContainer &&
      !this.popupContainer.nativeElement.contains(event.target)
    ) {
      this.closePopup();
    }
  }
}
