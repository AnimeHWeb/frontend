import { Injectable } from '@angular/core';
import { ApiService } from '../config-service/api.service';
import { API_CONFIG } from '../config-service/config';
import { SERVER_RESPONSE } from '../../models/ApiResponse';
import {
  ICommentFilmResponse,
  PageResponse,
} from '../../models/InterfaceResponse';
import {
  IDataCreateNewComment,
  IDataReplyComment,
} from '../../models/InterfaceData';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  constructor(private api: ApiService) {}

  getAllRootComments(animeId: string, page: number, size: number) {
    return this.api.get<SERVER_RESPONSE<PageResponse<ICommentFilmResponse>>>(
      API_CONFIG.ENDPOINTS.GET.GET_ALL_ROOT_COMMENTS(animeId, page, size)
    );
  }

  getActiveRootComments(animeId: string, page: number, size: number) {
    return this.api.get<SERVER_RESPONSE<PageResponse<ICommentFilmResponse>>>(
      API_CONFIG.ENDPOINTS.GET.GET_ACTIVE_ROOT_COMMENTS(animeId, page, size)
    );
  }

  createComment(data: IDataCreateNewComment) {
    return this.api.post<SERVER_RESPONSE<ICommentFilmResponse>>(
      API_CONFIG.ENDPOINTS.POST.POST_CREATE_NEW_COMMENT,
      data
    );
  }

  replyComment(data: IDataReplyComment) {
    return this.api.post<SERVER_RESPONSE<ICommentFilmResponse>>(
      API_CONFIG.ENDPOINTS.POST.POST_REPLY_COMMENT,
      data
    );
  }
}
