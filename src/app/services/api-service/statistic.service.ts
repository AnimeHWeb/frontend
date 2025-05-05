import { Injectable } from '@angular/core';
import { ApiService } from '../config-service/api.service';
import { API_CONFIG } from '../config-service/config';
import { SERVER_RESPONSE } from '../../models/ApiResponse';
import { IAnimeStatisticResponse } from '../../models/InterfaceResponse';

@Injectable({
  providedIn: 'root',
})
export class StatisticService {
  constructor(private api: ApiService) {}

  getStatisticAnimes() {
    return this.api.get<SERVER_RESPONSE<IAnimeStatisticResponse>>(
      API_CONFIG.ENDPOINTS.GET.GET_STATISTIC_ANIMES
    );
  }
}
