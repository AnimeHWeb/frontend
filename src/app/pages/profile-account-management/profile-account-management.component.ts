import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { closeForm, openForm } from '../../store/open-form-state/form.actions';
import { UserProfileComponent } from '../../components/multi-structure/user-profile/user-profile.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ModeratorApprovalComponent } from '../../components/multi-structure/moderator-approval/moderator-approval.component';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from '../../services/api-service/auth.service';
import { IFullInfoAccountRessponse } from '../../models/InterfaceResponse';
import { WarningModalComponent } from '../../components/regular/popup-warning/warning-modal.component';
import { Observable } from 'rxjs';
import { selectOpenedForms } from '../../store/open-form-state/form.selectors';
import { selectIsAuthenticated } from '../../store/auth/auth.selectors';
import { sendNotification } from '../../utils/notification';

@Component({
  selector: 'app-profile-account-management',
  imports: [
    UserProfileComponent,
    CommonModule,
    ModeratorApprovalComponent,
    WarningModalComponent,
  ],
  templateUrl: './profile-account-management.component.html',
  styleUrls: ['./profile-account-management.component.scss'],
})
export class ProfileAccountManagementComponent implements OnInit {
  isOpenForm$: Observable<{ [key: string]: boolean }>;
  isAuth$: Observable<boolean>;
  accountId: string = '';
  requestId: string = '';
  role: string = '';
  token: string = '';
  isloading: boolean = false;
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
    private store: Store,
    private route: ActivatedRoute,
    private cookieService: CookieService,
    private authService: AuthService
  ) {
    this.isOpenForm$ = this.store.select(selectOpenedForms);
    this.role = this.cookieService.get('role');
    this.isAuth$ = this.store.select(selectIsAuthenticated);
    this.token = localStorage.getItem('token') ?? '';
  }

  ngOnInit() {
    // Get the updated accountId from the route parameters
    this.accountId = this.route.snapshot.paramMap.get('id') ?? '';
    console.log('ID cập nhật:', this.accountId);
    this.fetchRequestModerator();
  }

  fetchRequestModerator() {
    if (this.accountId) {
      this.authService.getModeratorRequestsByUserId(this.accountId).subscribe({
        next: (res) => {
          console.log(
            'request ID:',
            res.result.content[0]?.id ?? 'Không có request'
          );
          if (res.result.content[0]?.status === 'pending') {
            this.requestId = res.result.content[0].id;
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
    } else {
      console.log('Không nhận được User ID');
    }
  }

  handleUserInfoUpdated(updatedUserInfo: IFullInfoAccountRessponse) {
    this.userInfo = updatedUserInfo;
  }

  lockAccount(userId: string) {
    console.log(userId, 'đã khoá');
    this.isAuth$.subscribe((isAuthenticated) => {
      if (isAuthenticated && this.token && this.role === 'ROLE_ADMIN') {
        this.authService.deactiveUserById(userId).subscribe({
          next: (res) => {
            sendNotification(this.store, 'Đã khoá', res.message, 'success');
            this.isloading = false;
          },
          error: (err) => {
            console.log(err);
            this.isloading = false;
          },
        });
      } else {
        sendNotification(
          this.store,
          'Lỗi!',
          'Xác thực lỗi, vui lòng thử lại!',
          'error'
        );
        this.isloading = false;
      }
      this.closePopup();
    });
  }

  closePopup() {
    this.store.dispatch(closeForm({ formType: 'lock-account' }));
  }

  handleLockAccount() {
    this.store.dispatch(openForm({ formType: 'lock-account' }));
  }
}
