import { Component, OnInit, SimpleChanges } from '@angular/core';
import { ApiService } from '../../../services/config-service/api.service';
import { IAccountUserResponse } from '../../../models/InterfaceResponse';
import { SERVER_RESPONSE } from '../../../models/ApiResponse';
import { API_CONFIG } from '../../../services/config-service/config';
import { MoviesService } from '../../../services/api-service/movies.service';
import { AuthService } from '../../../services/api-service/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { sizeImg } from '../../../models/DataRoot';
import { PaginationComponent } from '../../regular/pagination/pagination.component';
import { buildImageUrl } from '../../../utils/stringProcess';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  imports: [CommonModule, PaginationComponent],
})
export class UserListComponent implements OnInit {
  users: IAccountUserResponse[] = [];
  avatarImg: string = '';

  // Các biến liên quan đến phân trang
  page: number = 1; // trang hiện tại
  size: number = 10; // số phần tử trên 1 trang
  totalItems: number = 0; // tổng số người dùng

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['users']) {
      this.users = changes['user'].currentValue;
    }
  }

  buildImgAvatarUrl(url: string) {
    return buildImageUrl(url, 'small');
  }

  loadUsers(): void {
    this.authService.getAllUsers(this.page - 1, this.size).subscribe({
      next: (response) => {
        if (response && response.result) {
          // Gán dữ liệu
          this.users = response.result.content;
          // Tổng số user để truyền vào pagination
          this.totalItems = response.result.totalElements;
        }
      },
      error: (error) => {
        console.error('Error fetching users:', error);
      },
    });
  }

  /**
   * Hàm xử lý khi người dùng chuyển trang
   * @param newPage trang mới
   */
  onPageChange(newPage: number) {
    this.page = newPage;
    this.loadUsers();
  }

  handleChooseAccount(id: string) {
    this.router.navigate(['/profile-account-management', id]);
  }
}
