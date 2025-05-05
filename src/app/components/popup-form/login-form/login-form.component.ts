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
import {
  closeForm,
  openForm,
} from '../../../store/open-form-state/form.actions';
import { InteractiveButtonComponent } from '../../regular/button/button.component';
import { DynamicInputComponent } from '../../regular/input/input.component';
import {
  IDataLoginUsername,
  IDataLoginEmail,
} from '../../../models/InterfaceData';
import { AuthService } from '../../../services/api-service/auth.service';
import { SERVER_RESPONSE } from '../../../models/ApiResponse';
import { ILoginResponse } from '../../../models/InterfaceResponse';
import { selectNotifications } from '../../../store/notification/notification.selector';
import { INotification } from '../../../models/InterfaceData';
import { CookieService } from 'ngx-cookie-service';
import { login } from '../../../store/auth/auth.actions';
import { sendNotification } from '../../../utils/notification';

@Component({
  selector: 'app-popup-login-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InteractiveButtonComponent,
    DynamicInputComponent,
  ],
  templateUrl: `./login-form.component.html`,
  styleUrl: `./login-form.component.scss`,
})
export class LoginFormPopupComponent {
  openedForms$: Observable<{ [key: string]: boolean }>;
  shouldValidate = false;
  loading = false;
  data: IDataLoginUsername = {
    username: '',
    password: '',
  };

  notifications$: Observable<INotification[]>;

  @Output() close = new EventEmitter<void>();
  @ViewChild('popupContainer') popupContainer!: ElementRef;

  constructor(
    private store: Store,
    private authService: AuthService,
    private cookieService: CookieService
  ) {
    this.openedForms$ = this.store.select(selectOpenedForms);
    this.notifications$ = this.store.select(selectNotifications);
  }

  handleOpenRegisterForm() {
    this.store.dispatch(openForm({ formType: 'register' }));
  }

  handleForgotPassword() {
    this.store.dispatch(openForm({ formType: 'forgot-password' }));
  }

  handleOnChangeUserName(u: string) {
    this.data.username = u;
  }

  handleOnChangePassWord(p: string) {
    this.data.password = p;
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

  private setUserCookies(userData: { [key: string]: string }): void {
    Object.entries(userData).forEach(([key, value]) => {
      this.cookieService.set(key, value);
    });
  }

  /** Xử lý đăng nhập */
  onFormSubmit() {
    this.validateInput();
    console.log(this.data);
    // Chờ một chút để validation chạy xong
    setTimeout(() => {
      if (this.data.username && this.data.password) {
        this.loading = true; // Bật loading

        // Kiểm tra username có chứa "@" không?
        if (this.data.username.includes('@')) {
          const dataLogin: IDataLoginEmail = {
            email: this.data.username,
            password: this.data.password,
          };

          this.authService.loginByEmail(dataLogin).subscribe({
            next: (response: SERVER_RESPONSE<ILoginResponse>) => {
              this.handleLoginSuccess(response);
            },
            error: (error) => {
              console.log(error);
              this.loading = false;
            },
          });
        } else {
          const dataLogin: IDataLoginUsername = {
            username: this.data.username,
            password: this.data.password,
          };
          console.log(dataLogin);

          this.authService.loginByUsername(dataLogin).subscribe({
            next: (response: SERVER_RESPONSE<ILoginResponse>) => {
              this.handleLoginSuccess(response);
            },
            error: (error) => {
              console.log(error);
              this.loading = false;
            },
          });
        }
      } else {
        console.log('Vui lòng nhập đầy đủ thông tin đăng nhập');
      }
    }, 100);
  }

  /** Xử lý khi đăng nhập thành công */
  private handleLoginSuccess(response: SERVER_RESPONSE<ILoginResponse>) {
    console.log('Đăng nhập thành công:', response);
    sendNotification(this.store, 'Thành công', response.message, 'success');
    this.store.dispatch(login());
    this.setUserCookies({
      username: response.result.username,
      email: response.result.email,
      role: response.result.role,
      avatarUrl: response.result.avatarUrl,
      access_token: response.result.tokenAccessType,
      refresh_token: response.result.refreshValue,
      expiry_time: response.result.expiryTime,
    });
    localStorage.setItem('token', response.result.accessToken);
    // Xử lý lưu token hoặc thông tin user

    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  closePopup() {
    this.store.dispatch(closeForm({ formType: 'login' }));
    this.data = {
      username: '',
      password: '',
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
