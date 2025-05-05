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
import { IUpdatePassword } from '../update-password/update-password.component';

@Component({
  selector: 'app-forgot-password',
  imports: [
    CommonModule,
    FormsModule,
    InteractiveButtonComponent,
    DynamicInputComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  openedForms$: Observable<{ [key: string]: boolean }>;
  shouldValidate = false;
  loading = false;
  email: string = '';
  confirmPassword: string = '';

  notifications$: Observable<INotification[]>;

  @Output() close = new EventEmitter<void>();
  @ViewChild('popupContainer') popupContainer!: ElementRef;

  constructor(private store: Store, private authService: AuthService) {
    this.openedForms$ = this.store.select(selectOpenedForms);
    this.notifications$ = this.store.select(selectNotifications);
  }

  handleEmail(e: string) {
    this.email = e;
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
    // Chờ một chút để validation chạy xong
    setTimeout(() => {
      if (this.email) {
        this.loading = true; // Bật loading

        this.authService.forgotPassword(this.email).subscribe({
          next: (res) => {
            sendNotification(
              this.store,
              'Gửi yêu cầu thành công!',
              res.message,
              'success'
            );
            this.loading = false;
            this.closePopup();
          },
          error: (err) => {
            console.log(err);
            this.loading = false;
          },
        });
      } else {
        console.log('Vui lòng nhập đầy đủ thông tin đăng nhập');
        this.loading = false;
      }
    }, 100);
  }

  closePopup() {
    this.store.dispatch(closeForm({ formType: 'forgot-password' }));
    this.email = '';
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
