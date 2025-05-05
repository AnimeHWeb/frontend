import { Component, HostListener } from '@angular/core';
import { addNotification } from '../../store/notification/notification.action';
import { login, logout } from '../../store/auth/auth.actions';
import { INotification } from '../../models/InterfaceData';
import { closeForm, openForm } from '../../store/open-form-state/form.actions';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { Store } from '@ngrx/store';
import { AuthService } from '../../services/api-service/auth.service';
import { Observable, Subscription } from 'rxjs';
import { selectOpenedForms } from '../../store/open-form-state/form.selectors';
import { selectIsAuthenticated } from '../../store/auth/auth.selectors';
import { WarningModalComponent } from '../../components/regular/popup-warning/warning-modal.component';
import { UpdatePasswordComponent } from '../../components/popup-form/update-password/update-password.component';
import { RegModeratorComponent } from '../../components/popup-form/reg-moderator/reg-moderator.component';
import { RegisterFormComponent } from '../../components/popup-form/register-form/register-form.component';
import { ForgotPasswordComponent } from '../../components/popup-form/forgot-password/forgot-password.component';
import { LoginFormPopupComponent } from '../../components/popup-form/login-form/login-form.component';
import { HeaderComponent } from '../../components/layout/header/header.component';
import { SidebarComponent } from '../../components/layout/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    RouterModule,
    SidebarComponent,
    HeaderComponent,
    CommonModule,
    LoginFormPopupComponent,
    RegisterFormComponent,
    WarningModalComponent,
    RegModeratorComponent,
    UpdatePasswordComponent,
    ForgotPasswordComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent {
  isOpen = true; // Trạng thái menu
  isMobile = false;
  isOpenForm$: Observable<{ [key: string]: boolean }>;
  isAuth$: Observable<boolean>;
  token: string = '';
  role: string = '';
  isloading: boolean = false;
  isAuthenticated = false;

  constructor(
    private store: Store,
    private cookieService: CookieService,
    private router: Router,
    private authService: AuthService
  ) {
    this.isOpenForm$ = this.store.select(selectOpenedForms);
    this.isAuth$ = this.store.select(selectIsAuthenticated);
    this.token = this.cookieService.get('refesh_token');
    this.role = this.cookieService.get('role');

    //nếu cookie bị mất thì xoá token bảo đảm tính bảo mật
    if (!this.role) {
      localStorage.removeItem('token');
    }

    const screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      this.isOpen = false;
      this.isMobile = true;
    } else {
      this.isMobile = false;
      return;
    }
  }

  // Lắng nghe sự kiện resize của cửa sổ
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (event.target.innerWidth < 768) {
      this.isOpen = false; // Đóng menu khi kích thước màn hình nhỏ hơn 768px
      this.isMobile = true;
    } else {
      // Giữ nguyên trạng thái của menu khi kích thước màn hình lớn hơn hoặc bằng 768px
      this.isMobile = false;
      return;
    }
  }

  //TODO: Mở ra khi chạy với server
  ngOnInit() {
    const expiryTime = this.cookieService.get('expiry_time');

    if (expiryTime) {
      const expiryDate = new Date(expiryTime);
      const now = new Date();
      // So sánh với thời gian hiện tại
      if (expiryDate <= now) {
        console.log('Token đã hết hạn.');
        this.refreshToken();
        return;
      }
    }

    const tokenAccess = localStorage.getItem('token');
    if (!tokenAccess && this.role !== '') {
      this.cookieService.deleteAll();
      localStorage.removeItem('token');
    }
    if (!!tokenAccess) {
      this.authService.checktoken().subscribe({
        next: (response) => {
          if (response.code === 20000) {
            this.store.dispatch(login());
          } else {
            this.handleOpenAlertReLogin();
            console.log(response);
          }
        },
        error: (err) => {
          console.error('Lỗi khi kiểm tra token:', err);
          this.handleOpenAlertReLogin();
          console.log(err);
        },
      });
    }
  }

  private setUserCookies(userData: { [key: string]: string }): void {
    Object.entries(userData).forEach(([key, value]) => {
      this.cookieService.set(key, value);
    });
  }

  refreshToken() {
    const refresh_token = this.cookieService.get('refresh_token');
    this.authService.refreshToken(refresh_token).subscribe({
      next: (response) => {
        console.log(response);
        this.setUserCookies({
          username: response.result.username,
          email: response.result.email,
          role: response.result.role,
          access_token: response.result.tokenAccessType,
          refresh_token: response.result.refreshValue,
          expiry_time: response.result.expiryTime,
        });
        localStorage.setItem('token', response.result.accessToken);
      },
      error: (err) => {
        console.log(err);
        this.cookieService.deleteAll();
        localStorage.clear();
        this.store.dispatch(logout());
      },
    });
  }

  handleOpenAlertReLogin() {
    this.store.dispatch(openForm({ formType: 're-login-required-form' }));
  }

  toggleMenu(isOpen: boolean) {
    this.isOpen = isOpen;
  }

  // openPopup() {
  //   this.store.dispatch(openForm({ formType: 'login' }));
  //   this.store.dispatch(openForm({ formType: 'register' }));
  // }

  closePopup() {
    this.store.dispatch(closeForm({ formType: 'login' }));
    this.store.dispatch(closeForm({ formType: 'register' }));
    this.store.dispatch(closeForm({ formType: 'forgot-password' }));
    this.store.dispatch(closeForm({ formType: 'modal-warning' }));
    this.store.dispatch(closeForm({ formType: 'reg-moderator' }));
    this.store.dispatch(closeForm({ formType: 're-login-required-form' }));
  }

  onConfirmLogout() {
    this.isloading = true;
    this.router.navigate(['']);
    this.authService.logout(this.token).subscribe({
      next: (response) => {
        this.handleLogoutSuccess(response.status, response.message);
      },
      error: (error) => {
        this.clearSessionAndCookies();
        setTimeout(() => {
          this.closePopup();
          window.location.reload();
        }, 2000);
      },
    });
  }

  private handleLogoutSuccess(status: string, message: string) {
    this.clearSessionAndCookies();
    this.createAndDispatchNotification(
      'Đăng xuất thành công',
      message,
      'success'
    );
    setTimeout(() => {
      this.closePopup();
      window.location.reload();
    }, 2000);
  }

  private createAndDispatchNotification(
    title: string,
    message: string,
    type: 'success' | 'error'
  ) {
    const notification: INotification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      timestamp: new Date(),
    };
    this.store.dispatch(addNotification({ notification }));
    this.store.dispatch(logout());
  }

  private clearSessionAndCookies() {
    localStorage.removeItem('token');
    sessionStorage.clear();
    this.cookieService.deleteAll();
  }

  reLogin() {
    this.isloading = true;
    this.onConfirmLogout();
    this.store.dispatch(logout());
    this.clearSessionAndCookies();
    setTimeout(() => {
      this.closePopup();
      window.location.reload();
    }, 2000);
  }
}
