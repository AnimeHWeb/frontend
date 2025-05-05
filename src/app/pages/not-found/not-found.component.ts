import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  statusCode: string = '';
  errorMessage: string = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    // Lấy tham số status-code từ URL
    this.route.paramMap.subscribe((params) => {
      this.statusCode = params.get('status-code') || '404';
      this.setErrorMessage(this.statusCode);
    });
  }

  goToHome() {
    this.router.navigate(['/']);
  }

  // Phân loại thông báo dựa trên status code
  setErrorMessage(code: string): void {
    switch (code) {
      case '401':
        this.errorMessage = 'Bạn không có quyền truy cập';
        break;
      case '404':
        this.errorMessage = 'Opps! Trang không tồn tại';
        break;
      case '500':
        this.errorMessage = 'Có lỗi xảy ra ở server';
        break;
      default:
        this.errorMessage = 'Có lỗi xảy ra';
        break;
    }
  }
}
