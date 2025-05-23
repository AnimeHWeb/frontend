import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../services/api-service/payment.service';
import { sendNotification } from '../../../utils/notification';
import { Store } from '@ngrx/store';
import { IDepositGPData } from '../../../models/InterfaceData';
import { FormatViewPipe } from '../../../pipes/format-view.pipe';

@Component({
  selector: 'app-qr-payment',
  standalone: true,
  imports: [CommonModule, FormatViewPipe],
  templateUrl: './qr-payment.component.html',
  styleUrls: ['./qr-payment.component.scss'],
})
export class QrPaymentComponent implements OnInit, OnDestroy {
  amount: number = 0; // Số tiền VNĐ người dùng nhập
  qrUrl: string = ''; // URL QR code
  transactionSuccess: boolean = false;
  error: string = '';
  loading: boolean = false;
  countdown: number = 120; // Thời gian đếm ngược ban đầu
  resetCountDown: number = 120;
  userId: string = '';
  paymentHash: string = ''; // Mã hash duy nhất cho mỗi lần thanh toán
  matchedTransaction: any = null; // Lưu giao dịch phù hợp khi thanh toán thành công
  currentGp: number = 0;

  // Thông tin sẵn có để generate QR
  private bankId: string = 'MBBank';
  private accountNo: string = '0346567085';
  private template: string = '7brqL9G';
  private accountName: string = 'TO QUANG DUC';

  // Subscription để lặp (RxJS interval)
  private transactionCheckSubscription?: Subscription;
  private countdownInterval?: Subscription;

  constructor(private paymentService: PaymentService, private store: Store) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('token') ?? '';
    // Khởi tạo thời gian đếm ngược
    this.countdown = this.resetCountDown;
    this.reloadCurrentGP();
  }

  ngOnDestroy(): void {
    this.transactionCheckSubscription?.unsubscribe();
    this.countdownInterval?.unsubscribe();
  }

  // Hàm tạo mã hash duy nhất (có thể tùy chỉnh theo yêu cầu)
  generateUniqueHash(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  reloadCurrentGP() {
    this.paymentService.getCurrentGp().subscribe((res) => {
      this.currentGp = res.result;
    });
  }

  // Hàm chuyển đổi VNĐ -> GP (demo: 1.000 VNĐ = 1 GP)
  convertToGP(amountVND: number): number {
    return amountVND ? Math.floor(amountVND / 1000) : 0;
  }

  // Khi người dùng nhập số tiền thanh toán
  onAmountChange(event: any): void {
    const value = parseInt(event.target.value, 10);

    const maxAmount = 20000000; //20 triệu

    // Nếu giá trị nhập vượt quá maxAmount, thông báo và gán lại maxAmount
    if (value > maxAmount) {
      sendNotification(
        this.store,
        'Giá trị không hợp lệ!',
        `Số tiền không được vượt quá ${maxAmount.toLocaleString()} VNĐ.`,
        'warning'
      );
      this.amount = maxAmount;
      event.target.value = maxAmount; // cập nhật lại giá trị hiển thị
    } else {
      this.amount = value;
    }

    if (!this.userId) {
      sendNotification(
        this.store,
        'Có lỗi xảy ra!',
        'Lỗi xác thực thông tin tài khoản thanh toán. Hãy tải lại trang.',
        'error'
      );
      return;
    }

    // Kiểm tra số tiền hợp lệ (bội số của 1000)
    if (this.amount > 1999 && this.amount % 1000 === 0) {
      // Tạo mã hash mới cho lần thanh toán này
      this.paymentHash = this.generateUniqueHash();
      // Dùng paymentHash làm thông tin nhận diện trong URL QR
      this.qrUrl = `https://img.vietqr.io/image/${this.bankId}-${this.accountNo}-${this.template}.png?amount=${this.amount}&addInfo=${this.paymentHash}&accountName=${this.accountName}`;
      // Reset lại countdown và thông tin giao dịch
      this.countdown = this.resetCountDown;
      this.matchedTransaction = null;
    } else {
      this.qrUrl = '';
    }
  }

  // Khi nhấn nút Xác nhận
  handlePaymentClick(): void {
    const minAmount = 2000;

    // Nếu giá trị nhập vượt quá maxAmount, thông báo và gán lại maxAmount
    if (this.amount < minAmount) {
      sendNotification(
        this.store,
        'Giá trị không hợp lệ!',
        `Số tiền thanh toán ít nhất là ${minAmount.toLocaleString()} VNĐ.`,
        'warning'
      );
      return;
    }

    if (this.amount <= 0) {
      sendNotification(
        this.store,
        'Yêu cầu nhập mệnh giá!',
        'Vui lòng nhập số tiền muốn thanh toán để tiếp tục',
        'warning'
      );
      return;
    }

    if (this.amount % 1000 !== 0) {
      sendNotification(
        this.store,
        'Mệnh giá không hợp lệ!',
        'Vui lòng nhập số tiền là bội số của 1000',
        'warning'
      );
      return;
    }

    // Reset lại trạng thái và các thông số trước khi gọi API
    this.countdown = this.resetCountDown;
    this.transactionSuccess = false;
    this.loading = true;
    this.error = '';
    this.matchedTransaction = null;
    // // Tạo mã hash mới (nếu chưa tạo từ onAmountChange)
    if (!this.paymentHash) {
      // sessionStorage.setItem('qr', this.generateUniqueHash())
      this.paymentHash = this.generateUniqueHash();

      // Cập nhật URL QR với paymentHash mới
      this.qrUrl = `https://img.vietqr.io/image/${this.bankId}-${this.accountNo}-${this.template}.png?amount=${this.amount}&addInfo=${this.paymentHash}&accountName=${this.accountName}`;
    }

    // Bắt đầu kiểm tra giao dịch và countdown
    this.startCheckingTransactionStatus();
    this.startCountdown();
  }

  // Kích hoạt kiểm tra giao dịch định kỳ mỗi 5 giây
  startCheckingTransactionStatus(): void {
    this.transactionCheckSubscription?.unsubscribe();
    // Kiểm tra ngay lập tức
    this.checkTransactionStatus();
    // Sau đó cứ mỗi 5 giây kiểm tra lại nếu chưa thành công và còn thời gian
    this.transactionCheckSubscription = interval(5000).subscribe(() => {
      if (!this.transactionSuccess && this.countdown > 0) {
        this.checkTransactionStatus();
      }
    });
  }

  // Bắt đầu countdown
  startCountdown(): void {
    this.countdownInterval?.unsubscribe();
    this.countdownInterval = interval(1000).subscribe(() => {
      if (this.countdown > 0 && !this.transactionSuccess) {
        this.countdown--;
      }
      if (this.countdown === 0) {
        this.handleTimeout();
      }
    });
  }

  // Gọi API kiểm tra giao dịch
  checkTransactionStatus(): void {
    console.log(this.paymentHash);
    this.paymentService.checkTransactionStatus().subscribe({
      next: (res) => {
        const transactions = res.data || [];
        const matched = transactions.find(
          (transaction) =>
            transaction['Giá trị'] === this.amount &&
            transaction['Mô tả']?.toLowerCase().includes(this.paymentHash)
        );

        if (matched) {
          this.transactionSuccess = true;
          this.matchedTransaction = matched;
          this.transactionCheckSubscription?.unsubscribe();
          this.countdownInterval?.unsubscribe();
          this.loading = false;

          // Tạo đối tượng data sau khi đã có giao dịch phù hợp
          const data: IDepositGPData = {
            amount: this.amount / 1000,
            currency: 'GP',
            transactionCode: matched['Mã GD'].toString(),
            counterpartBankCode: matched['Mã tham chiếu'],
          };

          this.paymentService.depositGp(data).subscribe({
            next: (res) => {
              sendNotification(
                this.store,
                'Thanh toán thành công!',
                `Bạn đã chuyển khoản thành công số tiền ${matched['Giá trị']} VNĐ`,
                'success'
              );
              this.reloadCurrentGP();
              console.log(res);
            },
            error: (err) => {
              console.log(err);
            },
          });
          this.qrUrl = '';
        }
        // Không đặt this.loading = false ở đây để giữ hiệu ứng loading khi countdown đang chạy
      },
      error: () => {
        this.error = 'Thanh toán thất bại!';
        this.loading = false;
        this.transactionCheckSubscription?.unsubscribe();
        this.countdownInterval?.unsubscribe();
      },
    });
  }

  // Khi hết thời gian thanh toán
  handleTimeout(): void {
    this.error =
      'Không tìm thấy giao dịch của bạn. Vui lòng thử tạo giao dịch mới.';
    this.qrUrl = '';
    this.amount = 0;
    this.loading = false;
    this.transactionCheckSubscription?.unsubscribe();
    this.countdownInterval?.unsubscribe();
  }

  // Định dạng thời gian dạng m:ss
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }
}
