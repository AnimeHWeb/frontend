import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { SERVER_RESPONSE } from '../../../models/ApiResponse';
import {
  IOptionDropType,
  IUpdateProfileAccount,
} from '../../../models/InterfaceData';
import { AuthService } from '../../../services/api-service/auth.service';
import { Store } from '@ngrx/store';
import { selectOpenedForms } from '../../../store/open-form-state/form.selectors';
import { Observable } from 'rxjs';
import { closeForm } from '../../../store/open-form-state/form.actions';
import { selectNotifications } from '../../../store/notification/notification.selector';
import { INotification } from '../../../models/InterfaceData';
import { addNotification } from '../../../store/notification/notification.action';
import { CookieService } from 'ngx-cookie-service';
import { selectIsAuthenticated } from '../../../store/auth/auth.selectors';
import { InteractiveButtonComponent } from '../../regular/button/button.component';
import { DynamicInputComponent } from '../../regular/input/input.component';
import { CommonModule } from '@angular/common';
import { DropdownButtonComponent } from '../../regular/dropdown/dropdown.component';
import { sendNotification } from '../../../utils/notification';
import { IFullInfoAccountRessponse } from '../../../models/InterfaceResponse';

@Component({
  selector: 'app-edit-info-account',
  imports: [
    CommonModule,
    InteractiveButtonComponent,
    DynamicInputComponent,
    DropdownButtonComponent,
  ],
  templateUrl: './edit-info-account.component.html',
  styleUrl: './edit-info-account.component.scss',
})
export class EditInfoAccountComponent {
  @Input() infoAccount: IFullInfoAccountRessponse = {
    username: '',
    email: '',
    role: '',
    avatarUrl: '',
    backgroundUrl: '',
    displayName: '',
    fullName: '',
    gender: null,
    bio: '',
    cccd: '',
    phoneNumber: '',
    isActive: false,
    lastLogin: '',
    gpValue: 0,
    createdAt: '',
    updatedAt: '',
    moderatorRequestStatus: null,
  };

  openedForms$: Observable<{ [key: string]: boolean }>;
  isAuthenticated$!: Observable<boolean>;
  shouldValidate = false;
  loading = false;
  token: string = '';
  data: IUpdateProfileAccount;
  gender: IOptionDropType[] = [
    {
      value: true,
      label: 'Nam',
    },
    {
      value: false,
      label: 'Nữ',
    },
  ];
  selectedOptions: IOptionDropType = { value: null, label: 'Chọn giới tính' };

  notifications$: Observable<INotification[]>;

  @Output() close = new EventEmitter<void>();
  @ViewChild('popupContainer') popupContainer!: ElementRef;

  constructor(
    private store: Store,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {
    this.openedForms$ = this.store.select(selectOpenedForms);
    this.notifications$ = this.store.select(selectNotifications);
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.data = {
      displayName: this.infoAccount.displayName || '',
      fullName: this.infoAccount.fullName || '',
      gender: this.infoAccount.gender || null,
      bio: this.infoAccount.bio || '',
      phoneNumber: this.infoAccount.phoneNumber || '',
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['infoAccount'] && changes['infoAccount'].currentValue) {
      this.data = {
        displayName: this.infoAccount.displayName || '',
        fullName: this.infoAccount.fullName || '',
        gender: this.infoAccount.gender || null,
        bio: this.infoAccount.bio || '',
        phoneNumber: this.infoAccount.phoneNumber || '',
      };
    }
  }

  handleSelect(selected: IOptionDropType | IOptionDropType[]): void {
    if (Array.isArray(selected)) {
      this.selectedOptions = selected[0] || { value: null, label: '' }; // Lấy phần tử đầu tiên nếu có
    } else {
      this.selectedOptions = selected;
    }
    console.log(this.selectedOptions);
    this.data.gender = this.selectedOptions.value;
  }

  handleOnChangeBio(b: string) {
    this.data.bio = b;
  }

  handleOnChangeDisplayName(d: string) {
    this.data.displayName = d;
  }

  handleOnChangeFullName(fullName: string) {
    this.data.fullName = fullName;
  }

  handleOnChangePhoneNumber(phoneNumber: string) {
    this.data.phoneNumber = phoneNumber;
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
    console.log(this.data);
    setTimeout(() => {
      this.loading = true;
      this.authService.updateUser(this.data).subscribe({
        next: (res) => {
          this.handleUpdateSuccess(res);
        },
        error: (err) => {
          console.log('Cập nhật thất bại', err);
          this.loading = false;
        },
      });
    }, 100);
  }

  /** Xử lý khi đăng ký thành công */
  private handleUpdateSuccess(response: SERVER_RESPONSE<null>) {
    this.loading = false;
    console.log('Đăng ký thành công:', response);
    sendNotification(this.store, 'Thành công', response.message, 'success');
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    this.closePopup();
    console.log(this.data);
  }

  closePopup() {
    this.store.dispatch(closeForm({ formType: 'modal-update-info-account' }));
    this.loading = false;
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
