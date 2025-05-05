import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../services/api-service/payment.service';
import { IProductItem } from '../../../models/InterfaceData';
import { sendNotification } from '../../../utils/notification';
import { Store } from '@ngrx/store';
import { PaginationComponent } from '../../regular/pagination/pagination.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit {
  products: IProductItem[] = [];
  totalProducts: number = 0;
  currentPage: number = 1;
  pageSize: number = 6;
  loading: boolean = false;
  error: string = '';

  // Map để theo dõi số lượng mua cho mỗi sản phẩm (mặc định = 1)
  quantities: { [productId: string]: number } = {};

  constructor(private paymentService: PaymentService, private store: Store) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(page: number = 1): void {
    this.loading = true;
    // Giả sử API nhận page index 0-based
    this.paymentService.getAllProducts(page - 1, this.pageSize).subscribe({
      next: (response) => {
        const pageResult = response.result;
        this.products = pageResult.content;
        this.totalProducts = pageResult.totalElements;
        this.currentPage = pageResult.number + 1;
        // Khởi tạo số lượng mua mặc định cho từng sản phẩm
        this.products.forEach((product) => {
          if (!this.quantities[product.id]) {
            this.quantities[product.id] = 1;
          }
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error loading products.';
        this.loading = false;
      },
    });
  }

  onPageChanged(page: number): void {
    this.loadProducts(page);
  }

  increaseQuantity(productId: string): void {
    this.quantities[productId] = (this.quantities[productId] || 1) + 1;
  }

  decreaseQuantity(productId: string): void {
    if ((this.quantities[productId] || 1) > 1) {
      this.quantities[productId]--;
    }
  }

  onPurchase(product: IProductItem): void {
    const quantity = this.quantities[product.id] || 1;
    this.paymentService.purchaseProduct(product.id, quantity).subscribe({
      next: (res) => {
        sendNotification(
          this.store,
          'Mua thành công!',
          `Bạn đã mua ${quantity} sản phẩm: ${product.name}`,
          'success'
        );
        // Optionally, cập nhật lại danh sách sản phẩm hoặc số dư nếu cần
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
