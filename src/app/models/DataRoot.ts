import {
  Home,
  Film,
  History,
  Filter,
  Save,
  CalendarDays,
  TicketCheck,
  UserRoundCog,
} from 'lucide-angular';
import { ICommentFilmResponse } from './InterfaceResponse';

//lưu data fix cứng
export const dataAvatarOptions = [
  {
    id: 1,
    label: 'Đăng nhập',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-in"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>',
    role: {
      ROLE_GUEST: true,
      ROLE_USER: false,
      ROLE_MODERATOR: false,
      ROLE_ADMIN: false,
    },
  },
  {
    id: 2,
    label: 'Đăng ký',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ROLE_USER-plus"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>',
    role: {
      ROLE_GUEST: true,
      ROLE_USER: false,
      ROLE_MODERATOR: false,
      ROLE_ADMIN: false,
    },
  },
  {
    id: 3,
    label: 'Đăng ký cung cấp phim',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clapperboard"><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 4"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>',
    role: {
      ROLE_GUEST: true,
      ROLE_USER: true,
      ROLE_MODERATOR: false,
      ROLE_ADMIN: false,
    },
  },
  {
    id: 4,
    label: 'Đăng xuất',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>',
    role: {
      ROLE_GUEST: false,
      ROLE_USER: true,
      ROLE_MODERATOR: true,
      ROLE_ADMIN: true,
    },
  },
  {
    id: 5,
    label: 'Quản lý tài khoản',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ROLE_USER-round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>',
    role: {
      ROLE_GUEST: false,
      ROLE_USER: true,
      ROLE_MODERATOR: true,
      ROLE_ADMIN: true,
    },
  },
  {
    id: 6,
    label: 'Đổi mật khẩu',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-key-round"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/></svg>',
    role: {
      ROLE_GUEST: false,
      ROLE_USER: true,
      ROLE_MODERATOR: true,
      ROLE_ADMIN: true,
    },
  },
  {
    id: 7,
    label: 'Đồng bộ lịch sử xem',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-refresh-ccw-dot"><path d="M3 2v6h6"/><path d="M21 12A9 9 0 0 0 6 5.3L3 8"/><path d="M21 22v-6h-6"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/><circle cx="12" cy="12" r="1"/></svg>',
    role: {
      ROLE_GUEST: false,
      ROLE_USER: true,
      ROLE_MODERATOR: true,
      ROLE_ADMIN: true,
    },
  },
  {
    id: 8,
    label: 'Đồng bộ phim đã lưu',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-git-compare-arrows"><circle cx="5" cy="6" r="3"/><path d="M12 6h5a2 2 0 0 1 2 2v7"/><path d="m15 9-3-3 3-3"/><circle cx="19" cy="18" r="3"/><path d="M12 18H7a2 2 0 0 1-2-2V9"/><path d="m9 15 3 3-3 3"/></svg>',
    role: {
      ROLE_GUEST: false,
      ROLE_USER: true,
      ROLE_MODERATOR: true,
      ROLE_ADMIN: true,
    },
  },
  {
    id: 9,
    label: 'Dịch vụ & Thanh toán',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hand-coins"><path d="M11 15h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 17"/><path d="m7 21 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9"/><path d="m2 16 6 6"/><circle cx="16" cy="9" r="2.9"/><circle cx="6" cy="5" r="3"/></svg>',
    role: {
      ROLE_GUEST: false,
      ROLE_USER: true,
      ROLE_MODERATOR: true,
      ROLE_ADMIN: true,
    },
  },
  {
    id: 10,
    label: 'Dashboard',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-gauge"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>',
    role: {
      ROLE_GUEST: false,
      ROLE_USER: false,
      ROLE_MODERATOR: false,
      ROLE_ADMIN: true,
    },
  },
];

export const sidebarOptionsData = [
  {
    path: '/',
    label: 'Trang chủ',
    icon: Home,
    role: {
      ROLE_GUEST: true,
      ROLE_USER: true,
      ROLE_MODERATOR: true,
      ROLE_ADMIN: true,
    },
  },
  {
    path: '/watchlist',
    label: 'Phim đã lưu',
    icon: Save,
    role: {
      ROLE_GUEST: true,
      ROLE_USER: true,
      ROLE_MODERATOR: true,
      ROLE_ADMIN: true,
    },
  },
  {
    path: '/history-watch',
    label: 'Lịch sử xem',
    icon: History,
    role: {
      ROLE_GUEST: true,
      ROLE_USER: true,
      ROLE_MODERATOR: true,
      ROLE_ADMIN: true,
    },
  },
  {
    path: '/filter-advanced',
    label: 'Lọc phim',
    icon: Filter,
    role: {
      ROLE_GUEST: true,
      ROLE_USER: true,
      ROLE_MODERATOR: true,
      ROLE_ADMIN: true,
    },
  },
  {
    path: '/uploaded-film',
    label: 'Phim đã đăng',
    icon: Film,
    role: {
      ROLE_GUEST: false,
      ROLE_USER: false,
      ROLE_MODERATOR: true,
      ROLE_ADMIN: true,
    },
  },
  {
    path: '/upload-schedule',
    label: 'Lịch đăng tải',
    icon: CalendarDays,
    role: {
      ROLE_GUEST: false,
      ROLE_USER: false,
      ROLE_MODERATOR: true,
      ROLE_ADMIN: true,
    },
  },
  {
    path: '/movie-approval',
    label: 'Duyệt phim',
    icon: TicketCheck,
    role: {
      ROLE_GUEST: false,
      ROLE_USER: false,
      ROLE_MODERATOR: false,
      ROLE_ADMIN: true,
    },
  },
  {
    path: '/list-account',
    label: 'Quản lý User',
    icon: UserRoundCog,
    role: {
      ROLE_GUEST: false,
      ROLE_USER: false,
      ROLE_MODERATOR: false,
      ROLE_ADMIN: true,
    },
  },
];

export const sizeImg = {
  original: 'original',
  tiny: 'tiny',
  small: 'small',
};
