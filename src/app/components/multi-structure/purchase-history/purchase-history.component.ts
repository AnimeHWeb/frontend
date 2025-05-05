import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../services/api-service/payment.service';
import {
  IHistoryPurchaseResponse,
  PageResponse,
} from '../../../models/InterfaceResponse';
import { SERVER_RESPONSE } from '../../../models/ApiResponse';
import { PaginationComponent } from '../../regular/pagination/pagination.component';

@Component({
  selector: 'app-purchase-history',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './purchase-history.component.html',
  styleUrls: ['./purchase-history.component.scss'],
})
export class PurchaseHistoryComponent implements OnInit {
  purchases: IHistoryPurchaseResponse[] = [];
  totalPurchases: number = 0;
  currentPage: number = 1;
  pageSize: number = 6;
  loading: boolean = false;
  error: string = '';

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.loadPurchases(this.currentPage);
  }

  loadPurchases(page: number): void {
    this.loading = true;
    // Giả sử API sử dụng chỉ số trang 0-based, nên truyền (page - 1)
    this.paymentService.getMyPurchases(page - 1, this.pageSize).subscribe({
      next: (
        response: SERVER_RESPONSE<PageResponse<IHistoryPurchaseResponse>>
      ) => {
        const pageResult = response.result;
        this.purchases = pageResult.content;
        this.totalPurchases = pageResult.totalElements;
        // Nếu API trả về trang theo 0-based, chuyển sang 1-based cho giao diện
        this.currentPage = pageResult.number + 1;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading purchase history.';
        this.loading = false;
      },
    });
  }

  onPageChange(page: number): void {
    this.loadPurchases(page);
  }
}
