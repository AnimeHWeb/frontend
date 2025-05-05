import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';
import { SERVER_RESPONSE } from '../../../models/ApiResponse';
import { ILoginResponse } from '../../../models/InterfaceResponse';
import { IDataRegisterUser } from '../../../models/InterfaceData';
import { AuthService } from '../../../services/api-service/auth.service';
import { Store } from '@ngrx/store';
import { selectOpenedForms } from '../../../store/open-form-state/form.selectors';
import { Observable } from 'rxjs';
import {
  closeForm,
  openForm,
} from '../../../store/open-form-state/form.actions';
import { DynamicInputComponent } from '../../regular/input/input.component';
import { InteractiveButtonComponent } from '../../regular/button/button.component';
import { CommonModule } from '@angular/common';
import { selectNotifications } from '../../../store/notification/notification.selector';
import { INotification } from '../../../models/InterfaceData';
import { CookieService } from 'ngx-cookie-service';
import { formatUsername, isValidEmail } from '../../../utils/stringProcess';
import { sendNotification } from '../../../utils/notification';
import { login } from '../../../store/auth/auth.actions';

@Component({
  selector: 'app-register-form',
  imports: [CommonModule, DynamicInputComponent, InteractiveButtonComponent],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.scss',
})
export class RegisterFormComponent {
  openedForms$: Observable<{ [key: string]: boolean }>;
  shouldValidate = false;
  loading = false;
  passwordAgain: string = '';
  data: IDataRegisterUser = {
    username: '',
    email: '',
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

  toggleOpenRegModerator() {
    this.store.dispatch(openForm({ formType: 'reg-moderator' }));
  }

  handleOnChangeUserName(u: string) {
    this.data.username = u;
  }

  handleOnChangePassWord(p: string) {
    this.data.password = p;
  }

  handleOnChangeEmail(e: string) {
    this.data.email = e;
  }

  handleOnChangePasswordAgain(pa: string) {
    this.passwordAgain = pa;
  }

  validateInput() {
    this.shouldValidate = false;
    setTimeout(() => {
      this.shouldValidate = true;
    });
  }

  handleValidationResult(isValid: boolean) {
    if (isValid) {
      console.log('Input hợp lệ');
    } else {
      console.log('Input không hợp lệ');
    }
  }

  /** Xử lý đăng ký */
  onFormSubmit() {
    this.validateInput();
    console.log(this.data);
    if (this.data.password !== this.passwordAgain) {
      this.loading = false; // Tắt loading
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
      this.loading = true;
      if (!isValidEmail(this.data.email)) {
      }
      if (this.data.username && this.data.password) {
        const formattedUsername = formatUsername(this.data.username);
        const dataRegister: IDataRegisterUser = {
          username: formattedUsername,
          email: this.data.email,
          password: this.data.password,
        };
        this.authService.register(dataRegister).subscribe({
          next: (response: SERVER_RESPONSE<ILoginResponse>) => {
            this.handleRegisterSuccess(response);
          },
          error: (error) => {
            console.log(error);
            this.loading = false;
          },
        });
      } else {
        console.log('Vui lòng nhập đầy đủ thông tin đăng nhập');
      }
    }, 100);
    this.loading = false;
  }

  private setUserCookies(userData: { [key: string]: string }): void {
    Object.entries(userData).forEach(([key, value]) => {
      this.cookieService.set(key, value);
    });
  }

  /** Xử lý khi đăng ký thành công */
  private handleRegisterSuccess(response: SERVER_RESPONSE<ILoginResponse>) {
    this.loading = false; // Tắt loading
    console.log('Đăng ký thành công:', response);
    sendNotification(this.store, 'Thành công', response.message, 'success');
    localStorage.setItem('token', response.result.accessToken);
    this.store.dispatch(login());
    this.setUserCookies({
      username: response.result.username,
      email: response.result.email,
      role: response.result.role,
      access_token: response.result.tokenAccessType,
      expiry_time: response.result.expiryTime,
      refresh_token: response.result.refreshValue,
    });
    // Xử lý lưu token hoặc thông tin user
    this.closePopup();
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  closePopup() {
    this.store.dispatch(closeForm({ formType: 'register' }));
    this.data = {
      username: '',
      email: '',
      password: '',
    };
    this.passwordAgain = '';
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
