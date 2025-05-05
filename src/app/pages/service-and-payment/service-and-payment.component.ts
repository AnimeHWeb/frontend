import { Component } from '@angular/core';
import { QrPaymentComponent } from '../../components/multi-structure/qr-payment/qr-payment.component';
import { ProductListComponent } from '../../components/multi-structure/product-list/product-list.component';
import { PurchaseHistoryComponent } from '../../components/multi-structure/purchase-history/purchase-history.component';

@Component({
  selector: 'app-service-and-payment',
  imports: [QrPaymentComponent, ProductListComponent, PurchaseHistoryComponent],
  templateUrl: './service-and-payment.component.html',
  styleUrl: './service-and-payment.component.scss',
})
export class ServiceAndPaymentComponent {}
