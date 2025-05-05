import {
  Component,
  ElementRef,
  EventEmitter,
  Output,
  ViewChild,
} from '@angular/core';
import { SERVER_RESPONSE } from '../../../models/ApiResponse';
import {
  IGuestRequestModerator,
  IUserRequestModerator,
} from '../../../models/InterfaceData';
import { AuthService } from '../../../services/api-service/auth.service';
import { Store } from '@ngrx/store';
import { selectOpenedForms } from '../../../store/open-form-state/form.selectors';
import { Observable } from 'rxjs';
import { closeForm } from '../../../store/open-form-state/form.actions';
import { DynamicInputComponent } from '../../regular/input/input.component';
import { InteractiveButtonComponent } from '../../regular/button/button.component';
import { CommonModule } from '@angular/common';
import { selectNotifications } from '../../../store/notification/notification.selector';
import { INotification } from '../../../models/InterfaceData';
import { CookieService } from 'ngx-cookie-service';
import { selectIsAuthenticated } from '../../../store/auth/auth.selectors';
import { IModeratorRequestResponse } from '../../../models/InterfaceResponse';
import { sendNotification } from '../../../utils/notification';

@Component({
  selector: 'app-reg-moderator',
  standalone: true,
  imports: [CommonModule, DynamicInputComponent, InteractiveButtonComponent],
  templateUrl: './reg-moderator.component.html',
  styleUrl: './reg-moderator.component.scss',
})
export class RegModeratorComponent {
  openedForms$: Observable<{ [key: string]: boolean }>;
  isAuthenticated$: Observable<boolean>;
  shouldValidate = false;
  loading = false;
  token: string = localStorage.getItem('token') ?? '';
  role: string = 'ROLE_GUEST';
  passwordAgain: string = '';
  data: IGuestRequestModerator = {
    username: '',
    email: '',
    password: '',
    cccd: '',
    phoneNumber: '',
    fullName: '',
  };
  dataUser: IUserRequestModerator = {
    cccd: '',
    phoneNumber: '',
    fullName: '',
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
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);

    const storedPhoneNumber = this.cookieService.get('phoneNumber');
    const storedCccd = this.cookieService.get('cccd');
    const storedFullname = this.cookieService.get('fullName');
    if (storedPhoneNumber || storedCccd || storedFullname) {
      this.dataUser.phoneNumber = storedPhoneNumber;
      this.dataUser.cccd = storedCccd;
      this.dataUser.fullName = storedFullname;
    }
  }

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    this.role = this.cookieService.get('role');
    setTimeout(() => {
      if (this.token && this.role === 'ROLE_USER') {
        this.authService.getModeratorProfile().subscribe(
          (response) => {
            this.cookieService.set('fullName', response.result.fullName);
            this.cookieService.set('cccd', response.result.cccd);
            this.cookieService.set('phoneNumber', response.result.phoneNumber);
          },
          (error) => {
            console.error('Gọi API thất bại:', error);
            this.loading = false;
          }
        );
      }
    }, 500); // Delay 500ms để đảm bảo token đã được lưu
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

  handleOnChangeCccd(cccd: string) {
    if (!this.token && this.role === 'ROLE_GUEST') {
      this.data.cccd = cccd;
    } else {
      this.dataUser.cccd = cccd;
    }
  }
  handleOnChangeFullName(fullName: string) {
    if (!this.token) {
      this.data.fullName = fullName;
    } else {
      this.dataUser.fullName = fullName;
    }
  }

  handleOnChangePhoneNumber(phoneNumber: string) {
    if (!this.token && this.role === 'ROLE_GUEST') {
      this.data.phoneNumber = phoneNumber;
    } else {
      this.dataUser.phoneNumber = phoneNumber;
    }
  }

  validateInput() {
    this.shouldValidate = false;
    setTimeout(() => {
      this.shouldValidate = true;
    });
  }

  handleValidationResult(isValid: boolean) {
    console.log(isValid ? 'Input hợp lệ ✅' : 'Input không hợp lệ ❌');
  }

  /** Xử lý đăng ký */
  onFormSubmit() {
    this.validateInput();
    if (this.data.password !== this.passwordAgain) {
      this.loading = false;
      sendNotification(
        this.store,
        'Mật khẩu sai',
        'Mật khẩu nhập lại của bạn không khớp.',
        'error'
      );
      return;
    }

    setTimeout(() => {
      this.loading = true;
      if (!this.token && this.role === 'ROLE_GUEST') {
        this.authService.requestModeratorForGuest(this.data).subscribe({
          next: (response) => this.handleRegisterSuccess(response),
          error: (error) => console.log(error),
        });
      }
      if (!!this.isAuthenticated$ && this.role === 'ROLE_USER') {
        console.log(this.dataUser);
        this.authService.requestModeratorForUser(this.dataUser).subscribe({
          next: (response) => this.handleRegisterSuccess(response),
          error: (error) => console.log(error),
        });
      } else {
        console.log('Vui lòng nhập đầy đủ thông tin đăng nhập');
      }
    }, 100);
    this.loading = false;
  }

  /** Xử lý khi đăng ký thành công */
  private handleRegisterSuccess(
    response: SERVER_RESPONSE<IModeratorRequestResponse>
  ) {
    this.loading = false;
    console.log('Đăng ký thành công:', response);
    sendNotification(this.store, 'Thành công', response.message, 'success');
    this.closePopup();
  }

  closePopup() {
    this.store.dispatch(closeForm({ formType: 'reg-moderator' }));
    this.data = {
      username: '',
      email: '',
      password: '',
      fullName: '',
      cccd: '',
      phoneNumber: '',
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
