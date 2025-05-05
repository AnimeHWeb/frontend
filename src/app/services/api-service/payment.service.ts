import { Injectable } from '@angular/core';
import {
  IHistoryPurchaseResponse,
  ITransactionDepositResponse,
  ITransactionStatus,
  PageResponse,
} from '../../models/InterfaceResponse';
import { googleScriptCheckPaid } from '../../../environments/environment.secret';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../config-service/api.service';
import { SERVER_RESPONSE } from '../../models/ApiResponse';
import { API_CONFIG } from '../config-service/config';
import { IDepositGPData, IProductItem } from '../../models/InterfaceData';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  constructor(private http: HttpClient, private api: ApiService) {}

  checkTransactionStatus() {
    return this.http.get<ITransactionStatus>(googleScriptCheckPaid);
  }

  getCurrentGp() {
    return this.api.get<SERVER_RESPONSE<number>>(
      API_CONFIG.ENDPOINTS.GET.GET_CURRENTGP
    );
  }

  depositGp(data: IDepositGPData) {
    return this.api.post<SERVER_RESPONSE<ITransactionDepositResponse>>(
      API_CONFIG.ENDPOINTS.POST.POST_DEPOSIT_GP,
      data
    );
  }

  getAllProducts(page: number, size: number) {
    return this.api.get<SERVER_RESPONSE<PageResponse<IProductItem>>>(
      API_CONFIG.ENDPOINTS.GET.GET_ALL_PRODUCTS(page, size)
    );
  }

  purchaseProduct(productId: string, quantity: number) {
    return this.api.post<SERVER_RESPONSE<IProductItem>>(
      API_CONFIG.ENDPOINTS.POST.POST_PURCHASE_PRODUCT,
      { productId, quantity }
    );
  }

  getMyPurchases(page: number, size: number) {
    return this.api.get<
      SERVER_RESPONSE<PageResponse<IHistoryPurchaseResponse>>
    >(API_CONFIG.ENDPOINTS.GET.GET_PURCHASE_HISTORY(page, size));
  }
}
