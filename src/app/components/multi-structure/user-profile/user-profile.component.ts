import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AuthService } from '../../../services/api-service/auth.service';
import { CommonModule } from '@angular/common';
import { INotification } from '../../../models/InterfaceData';
import { addNotification } from '../../../store/notification/notification.action';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { IFullInfoAccountRessponse } from '../../../models/InterfaceResponse';
import { CookieService } from 'ngx-cookie-service';
import { API_CONFIG } from '../../../services/config-service/config';
import { sizeImg } from '../../../models/DataRoot';
import { sendNotification } from '../../../utils/notification';
import { EditInfoAccountComponent } from '../../popup-form/edit-info-account/edit-info-account.component';
import { closeForm } from '../../../store/open-form-state/form.actions';
import { selectOpenedForms } from '../../../store/open-form-state/form.selectors';
import { buildImageUrl } from '../../../utils/stringProcess';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule, EditInfoAccountComponent],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
})
export class UserProfileComponent implements OnInit {
  @Input() accountId: string | null = null;
  @Input() infoUserAccount: boolean = false;
  @Input() privateField: boolean = false;

  @Output() userInfoUpdated = new EventEmitter<IFullInfoAccountRessponse>();

  avatarDefault: string = 'assets/avatar-default.png';
  userAvatarUrl: string = '';
  backgroundUrl: string = '';
  isOpenForm$: Observable<{ [key: string]: boolean }>;
  userInfo: IFullInfoAccountRessponse = {
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

  constructor(
    private authService: AuthService,
    private store: Store,
    private cookieService: CookieService
  ) {
    this.isOpenForm$ = this.store.select(selectOpenedForms);
  }

  ngOnInit() {
    // Nếu accountId null và infoUserAccount false thì lấy thông tin profile của user
    if (this.accountId === null && !this.infoUserAccount) {
      this.authService.getProfile().subscribe((response) => {
        if (response.status === 'Ok') {
          this.userInfo = response.result;
          Object.keys(this.userInfo).forEach((key) => {
            const value =
              this.userInfo[key as keyof IFullInfoAccountRessponse] ?? '';
            this.cookieService.set(key, String(value));
          });
          this.userAvatarUrl = buildImageUrl(
            this.userInfo.avatarUrl,
            'original'
          );
          this.backgroundUrl = buildImageUrl(
            this.userInfo.backgroundUrl,
            'original'
          );
          console.log(this.userAvatarUrl);
        } else {
          console.log('Lấy dữ liệu Profile thất bại');
        }
      });
    } else if (this.accountId && this.infoUserAccount) {
      // Kiểm tra xem dữ liệu user đã được lưu trong sessionStorage chưa
      const storedUserInfo = sessionStorage.getItem(this.accountId ?? '');
      if (storedUserInfo) {
        // Nếu đã có dữ liệu thì sử dụng dữ liệu đó
        this.userInfo = JSON.parse(storedUserInfo);

        this.updateUserInfoUrls();
      } else {
        // Nếu chưa có thì gọi API để lấy dữ liệu
        this.authService.getUserById(this.accountId).subscribe((response) => {
          if (response.status === 'Ok') {
            this.userInfo = response.result;
            // Lưu dữ liệu vào sessionStorage để sử dụng cho lần sau
            sessionStorage.setItem(
              this.accountId ?? '',
              JSON.stringify(this.userInfo)
            );
            this.updateUserInfoUrls();
          } else {
            console.log('Lấy dữ liệu Profile thất bại');
          }
        });
      }
    } else {
      sendNotification(
        this.store,
        'Lỗi lấy thông tin!',
        'Hệ thống không lấy được thông tin tài khoản này',
        'error'
      );
    }
    this.userInfoUpdated.emit(this.userInfo);
  }

  closePopup() {
    this.store.dispatch(closeForm({ formType: 'modal-update-info-account' }));
  }

  // Cập nhật URL ảnh cho avatar và background
  private updateUserInfoUrls() {
    this.userAvatarUrl = buildImageUrl(this.userInfo.avatarUrl, 'original');
    this.backgroundUrl = buildImageUrl(this.userInfo.backgroundUrl, 'original');
  }

  private handleImageLoad(
    apiCall: () => Observable<Blob>,
    updateUrl: (url: string) => void
  ) {
    apiCall().subscribe({
      next: (blob) => {
        const objectURL = URL.createObjectURL(blob);
        updateUrl(objectURL);
      },
      error: (error) => {
        console.error('Lỗi khi tải ảnh:', error);
      },
    });
  }

  // Hàm tải ảnh đại diện
  loadAvatar() {
    this.handleImageLoad(
      () => this.authService.getAvatar('original'),
      (url) => (this.userAvatarUrl = url)
    );
  }

  // Hàm tải ảnh nền
  loadBackground() {
    this.handleImageLoad(
      () => this.authService.getBackground('original'),
      (url) => (this.backgroundUrl = url)
    );
  }

  private handleImageUpload(
    event: any,
    uploadApi: (file: File) => Observable<any>,
    successCallback: () => void
  ) {
    const file = event.target.files[0];
    if (file) {
      uploadApi(file).subscribe({
        next: () => {
          sendNotification(
            this.store,
            'Thành công',
            'Tải ảnh lên thành công',
            'success'
          );
          successCallback();
        },
        error: (err) => {
          console.error('Lỗi upload:', err);
        },
      });
    }
  }

  // Upload ảnh nền
  uploadBackground(event: any) {
    this.handleImageUpload(
      event,
      (file) => this.authService.uploadBackground(file),
      // () => this.loadBackground()
      () => window.location.reload()
    );
  }

  // Upload ảnh đại diện
  uploadAvatar(event: any) {
    this.handleImageUpload(
      event,
      (file) => this.authService.uploadAvatar(file),
      // () => this.loadAvatar()
      () => window.location.reload()
    );
  }
}
