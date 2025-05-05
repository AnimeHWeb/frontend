import { Injectable } from '@angular/core';
import { ApiService } from '../config-service/api.service';
import { API_CONFIG } from '../config-service/config';
import { INotice } from '../../models/InterfaceData';
import { SERVER_RESPONSE } from '../../models/ApiResponse';
import { PageResponse } from '../../models/InterfaceResponse';

@Injectable({
  providedIn: 'root',
})
export class NoticeService {
  constructor(private api: ApiService) {}

  getCurrentNotifications(page: number, size: number) {
    return this.api.get<SERVER_RESPONSE<PageResponse<INotice>>>(
      API_CONFIG.ENDPOINTS.GET.GET_CURRENT_NOTIFICATIONS(page, size)
    );
  }

  markAsReadMultiple(notificationIds: string[]) {
    return this.api.post<SERVER_RESPONSE<null>>(
      API_CONFIG.ENDPOINTS.POST.POST_MARK_AS_READ_NOTIFICATIONS,
      { notificationIds }
    );
  }

  countCurrentUnreadNotifications() {
    return this.api.get<SERVER_RESPONSE<number>>(
      API_CONFIG.ENDPOINTS.GET.GET_NUMBER_OF_UNREAD_NOTIFICATIONS
    );
  }
}
