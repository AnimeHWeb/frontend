import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  HostListener,
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectIsAuthenticated } from '../../../store/auth/auth.selectors';
import { login, logout } from '../../../store/auth/auth.actions';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  LucideAngularModule,
  Menu,
  Home,
  Film,
  History,
  Filter,
  Save,
  X,
} from 'lucide-angular';
import { selectBooleanState } from '../../../store/rerender/ui.selectors';
import { sidebarOptionsData } from '../../../models/DataRoot';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  imports: [CommonModule, RouterModule, LucideAngularModule],
})
export class SidebarComponent implements OnInit {
  isReloadOptionSidebar$: Observable<boolean>;
  isAuthenticated$!: Observable<boolean>;
  private role: 'ROLE_GUEST' | 'ROLE_USER' | 'ROLE_MODERATOR' | 'ROLE_ADMIN' =
    'ROLE_GUEST';
  icons = { Menu, X, Home, Film, History, Filter };
  sidebarOptions = sidebarOptionsData;
  isOpen = true;
  isMobile = false;
  initialPosition: { x: number; y: number } = { x: 0, y: 0 };
  currentPosition: { x: number; y: number } = { x: 0, y: 0 };
  isDragging: boolean = false;

  @Output() menuToggled = new EventEmitter<boolean>();

  constructor(private store: Store, private cookieService: CookieService) {
    this.isReloadOptionSidebar$ = this.store.select(
      selectBooleanState('isReloadOptionSidebar')
    );
    const screenWidth = window.innerWidth;
    if (screenWidth < 768) {
      this.isOpen = false;
      this.isMobile = true;
    } else {
      return;
    }
  }

  // Lắng nghe sự kiện resize của cửa sổ
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (event.target.innerWidth < 768) {
      this.isMobile = true;
    } else {
      this.isMobile = false;
    }
  }

  // Khởi tạo các phương thức khi bắt đầu kéo, kéo và kết thúc kéo
  startDrag(event: TouchEvent) {
    this.isDragging = true;
    this.initialPosition = {
      x: event.touches[0].clientX - this.currentPosition.x,
      y: event.touches[0].clientY - this.currentPosition.y,
    };
  }

  drag(event: TouchEvent) {
    if (!this.isDragging) return;

    this.currentPosition = {
      x: event.touches[0].clientX - this.initialPosition.x,
      y: event.touches[0].clientY - this.initialPosition.y,
    };

    // Cập nhật vị trí của icon
    const icon = document.querySelector('.icon-menu-custom') as HTMLElement;
    icon.style.transform = `translate(${this.currentPosition.x}px, ${this.currentPosition.y}px)`;
  }

  endDrag() {
    this.isDragging = false;
  }

  onClose() {
    if (this.isMobile) {
      this.isOpen = false;
    }
  }

  toggleMenu() {
    const screenWidth = window.innerWidth;

    // Kiểm tra nếu chiều rộng màn hình nhỏ hơn 768px thì không thực hiện việc phát sự kiện
    if (screenWidth >= 768) {
      this.isOpen = !this.isOpen;
      this.menuToggled.emit(this.isOpen); // Gửi trạng thái mới lên component cha
    } else {
      // Nếu màn hình nhỏ hơn 768px, chỉ thay đổi trạng thái mà không phát sự kiện
      this.isOpen = !this.isOpen;
    }
  }

  ngOnInit(): void {
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.setUserRole(); // Lấy role từ cookie
    this.filterSidebarOptions(); // Lọc danh sách option dựa trên role
  }

  private setUserRole(): void {
    const storedRole = this.cookieService.get('role') as
      | 'ROLE_GUEST'
      | 'ROLE_USER'
      | 'ROLE_MODERATOR'
      | 'ROLE_ADMIN';

    if (storedRole) {
      this.role = storedRole;
    }
  }

  // Lọc danh sách option dựa vào quyền hạn của user
  private filterSidebarOptions(): void {
    this.sidebarOptions = sidebarOptionsData.filter(
      (option) => option.role[this.role] === true
    );
  }
}
