import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../config-service/api.service';
import { API_CONFIG } from '../config-service/config';
import {
  IDataLoginEmail,
  IDataLoginUsername,
  IDataRegisterUser,
  IGuestRequestModerator,
  IUpdateProfileAccount,
  IUserRequestModerator,
} from '../../models/InterfaceData';
import { SERVER_RESPONSE } from '../../models/ApiResponse';
import {
  IAccountUserResponse,
  IFullInfoAccountRessponse,
  ILoginResponse,
  ILogoutResponse,
  IModeratorRequestResponse,
  IRequestModeratorByUserId,
  PageResponse,
} from '../../models/InterfaceResponse';
import { IUpdatePassword } from '../../components/popup-form/update-password/update-password.component';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private api: ApiService) {}

  register(dataRegister: IDataRegisterUser) {
    return this.api.post<SERVER_RESPONSE<ILoginResponse>>(
      API_CONFIG.ENDPOINTS.POST.POST_REGISTER,
      dataRegister
    );
  }

  loginByUsername(
    dataLogin: IDataLoginUsername
  ): Observable<SERVER_RESPONSE<ILoginResponse>> {
    return this.api.post<SERVER_RESPONSE<ILoginResponse>>(
      API_CONFIG.ENDPOINTS.POST.POST_LOGIN_USERNAME,
      dataLogin
    );
  }

  loginByEmail(dataLogin: IDataLoginEmail) {
    return this.api.post<SERVER_RESPONSE<ILoginResponse>>(
      API_CONFIG.ENDPOINTS.POST.POST_LOGIN_EMAIL,
      dataLogin
    );
  }

  logout(refresh_token: string) {
    return this.api.post<SERVER_RESPONSE<ILogoutResponse>>(
      API_CONFIG.ENDPOINTS.POST.POST_LOGOUT,
      { refresh_token }
    );
  }

  forgotPassword(email: string) {
    return this.api.post<SERVER_RESPONSE<null>>(
      API_CONFIG.ENDPOINTS.POST.POST_FORGOT_PASSWORD,
      { email }
    );
  }

  resetPassword(token: string, newPassword: string) {
    return this.api.post<SERVER_RESPONSE<null>>(
      API_CONFIG.ENDPOINTS.POST.POST_RESET_PASSWORD,
      {
        token,
        newPassword,
      }
    );
  }

  checktoken() {
    return this.api.get<SERVER_RESPONSE<ILogoutResponse>>(
      API_CONFIG.ENDPOINTS.GET.GET_CHECK_TOKEN
    );
  }

  refreshToken(refreshValue: string) {
    return this.api.post<SERVER_RESPONSE<ILoginResponse>>(
      API_CONFIG.ENDPOINTS.POST.POST_REFESH_TOKEN,
      { refreshValue }
    );
  }

  requestModeratorForGuest(dataRegisterModerator: IGuestRequestModerator) {
    return this.api.post<SERVER_RESPONSE<IModeratorRequestResponse>>(
      API_CONFIG.ENDPOINTS.POST.POST_GUEST_REQ_MODERATOR,
      dataRegisterModerator
    );
  }

  requestModeratorForUser(dataRegisterModerator: IUserRequestModerator) {
    return this.api.post<SERVER_RESPONSE<IModeratorRequestResponse>>(
      API_CONFIG.ENDPOINTS.POST.POST_USER_REQ_MODERATOR,
      dataRegisterModerator
    );
  }

  getModeratorProfile() {
    return this.api.get<SERVER_RESPONSE<IUserRequestModerator>>(
      API_CONFIG.ENDPOINTS.GET.GET_MODERATOR_PROFILE
    );
  }

  getAvatar(type: 'small' | 'tiny' | 'original'): Observable<Blob> {
    return this.api.getBlob(API_CONFIG.ENDPOINTS.GET.GET_ACCOUNT_AVATAR(type));
  }

  getBackground(type: 'small' | 'tiny' | 'original'): Observable<Blob> {
    return this.api.getBlob(
      API_CONFIG.ENDPOINTS.GET.GET_ACCOUNT_BACKGROUND(type)
    );
  }

  uploadBackground(file: File): Observable<any> {
    return this.api.uploadFile(
      API_CONFIG.ENDPOINTS.POST.POST_UPLOAD_BACKGROUND,
      file
    );
  }

  uploadAvatar(file: File): Observable<any> {
    return this.api.uploadFile(
      API_CONFIG.ENDPOINTS.POST.POST_UPLOAD_AVATAR,
      file
    );
  }

  getProfile() {
    return this.api.get<SERVER_RESPONSE<IFullInfoAccountRessponse>>(
      API_CONFIG.ENDPOINTS.GET.GET_INFO_ACCOUNT
    );
  }

  updateUser(dataUpdateAccount: IUpdateProfileAccount) {
    return this.api.patch<SERVER_RESPONSE<null>>(
      API_CONFIG.ENDPOINTS.PATCH.PATCH_UPDATE_INFO_ACCOUNT,
      dataUpdateAccount
    );
  }

  updateUserPassword(dataUpdatePassword: IUpdatePassword) {
    return this.api.patch<SERVER_RESPONSE<null>>(
      API_CONFIG.ENDPOINTS.PATCH.PATCH_UPDATE_PASSWORD,
      dataUpdatePassword
    );
  }

  getAllUsers(page: number, size: number) {
    return this.api.get<SERVER_RESPONSE<PageResponse<IAccountUserResponse>>>(
      API_CONFIG.ENDPOINTS.GET.GET_ALL_USER(page, size)
    );
  }

  getUserById(userId: string) {
    return this.api.get<SERVER_RESPONSE<IFullInfoAccountRessponse>>(
      API_CONFIG.ENDPOINTS.GET.GET_USER_BY_ID(userId)
    );
  }

  getModeratorRequestsByUserId(userId: string) {
    return this.api.get<
      SERVER_RESPONSE<PageResponse<IRequestModeratorByUserId>>
    >(API_CONFIG.ENDPOINTS.GET.GET_MODERATOR_REQUEST_BY_USER_ID(userId));
  }

  approveModeratorRequest(requestId: string) {
    return this.api.post<SERVER_RESPONSE<null>>(
      API_CONFIG.ENDPOINTS.POST.POST_APPROVE_MODERATOR(requestId),
      null
    );
  }

  rejectModeratorRequest(commentRejected: string, requestId: string) {
    return this.api.post<SERVER_RESPONSE<null>>(
      API_CONFIG.ENDPOINTS.POST.POST_REJECT_MODERATOR(requestId),
      commentRejected
    );
  }

  deactiveUserById(userId: string) {
    return this.api.patch<SERVER_RESPONSE<null>>(
      API_CONFIG.ENDPOINTS.PATCH.PATCH_LOCK_ACCOUNT(userId),
      null
    );
  }
}
