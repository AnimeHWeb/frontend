# AnimeH - Frontend

<!-- PROJECT SHIELDS (nếu cần) -->
<!--
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
-->

## 1. Giới thiệu

**AnimeH** là dự án website xem phim anime. Đây là **Frontend** được phát triển bằng **Angular** (v19.1.6). Mục tiêu cung cấp giao diện cho phép người dùng:

- Đăng ký/Đăng nhập
- Quản lý và cập nhật hồ sơ cá nhân (upload avatar/background)
- Đăng ký Moderator (đối với User/Guest)
- Xem danh sách phim, lọc phim, xem chi tiết, tìm kiếm, …
- Tương tác (như hiển thị thông báo, xem comment, …)
- Và các tính năng tiện ích khác…

Phiên bản hiện tại đã hoàn thành các chức năng chính nêu trên.

---

## 2. Công nghệ sử dụng

- **Angular v19.1.6** & TypeScript
- **@ngrx/store** (quản lý state Redux pattern)
- **@angular/router** (Routing)
- **@angular/animations**
- **SCSS** (styling)
- **ngx-cookie-service** (quản lý cookie)
- **LucideAngular** (icon)
- **date-fns** (xử lý thời gian)
- Và các thư viện liên quan khác...

---

## 3. Yêu cầu hệ thống (Requirements)

1. **Node.js** v16+ (khuyến nghị v18).
2. **Angular CLI** v15+ (hoặc tương đương).
3. Trình duyệt hiện đại (Chrome, Firefox, Edge, …).

---

## 4. Cấu trúc thư mục (Directory Structure)

```
├── src
│   ├── app
│   │   ├── app.component.(ts|html|scss)              # Root Component
│   │   ├── app.component.html
│   │   ├── app.routes.ts                             # Định nghĩa Routing cho toàn App
│   │   ├── components/
│   │   │   ├── layout/             # Header, Sidebar, Footer...
│   │   │   ├── multi-structure/    # Các block lớn (MovieCard, MovieInfo,...)
│   │   │   ├── popup-form/         # Popup đăng nhập, đăng ký, ...
│   │   │   └── regular/            # Component tái sử dụng (Button, Input, Dropdown, ...)
│   │   ├── models/                 # Định nghĩa Interface, type
│   │   ├── pages/                  # Trang chính (Home, PlayPage, ProfileAccount, ...)
│   │   ├── services/               # Gọi API, config, ...
│   │   │   ├── api-service/
│   │   │   └── config-service/
│   │   ├── store/                  # @ngrx store, actions, reducers, selectors...
│   │   │   ├── auth/
│   │   │   ├── notification/
│   │   │   ├── open-form-state/
│   │   │   └── rerender/
│   │   ├── app.component.scss
│   │   └── ...
│   ├── assets/                     # Assets
│   ├── environments/               # (nếu có)
│   ├── main.ts                     # Bootstrap application
│   ├── index.html
│   └── styles.scss                 # Global style
├── angular.json
├── package.json
├── tsconfig.json
├── tsconfig.app.json
└── ...
```

---

## 5. Chức năng đã hoàn thiện

### 5.1. Layout và Navigation

**Tệp chính liên quan**:

- **Header**:
  - [`src/app/components/layout/header/header.component.ts`](./src/app/components/layout/header/header.component.ts)
- **Footer**:
  - [`src/app/components/layout/footer/footer.component.ts`](./src/app/components/layout/footer/footer.component.ts)
- **Sidebar**:
  - [`src/app/components/layout/sidebar/sidebar.component.ts`](./src/app/components/layout/sidebar/sidebar.component.ts)
- **App Component (root)**:
  - [`src/app/app.component.ts`](./src/app/app.component.ts)

**Tính năng**:

- **Header**: chứa thanh tìm kiếm, thông báo, avatar user, dropdown, ...
- **Sidebar**: menu điều hướng theo role (Guest/User/Moderator/Admin)
- **Footer**: hiển thị thông tin footer
- **Router**: chuyển trang (Home, Play, Category, Profile, …)

---

### 5.2. Đăng nhập, Đăng ký, Đăng xuất, Quản lý xác thực

**Tệp chính liên quan**:

- **Service**:
  - [`src/app/services/api-service/auth.service.ts`](./src/app/services/api-service/auth.service.ts)
- **Popup**:
  - [`src/app/components/popup-form/login-form/login-form.component.ts`](./src/app/components/popup-form/login-form/login-form.component.ts)
  - [`src/app/components/popup-form/register-form/register-form.component.ts`](./src/app/components/popup-form/register-form/register-form.component.ts)
- **NgRx**:
  - [`src/app/store/auth/auth.reducer.ts`](./src/app/store/auth/auth.reducer.ts)
  - [`src/app/store/auth/auth.actions.ts`](./src/app/store/auth/auth.actions.ts)

**Tính năng**:

- **Đăng nhập**:
  - Popup form `LoginFormPopupComponent` (`/auth/login-username` hoặc `/auth/login-email`).
- **Đăng ký**:
  - Popup form `RegisterFormComponent` (`/auth/register`).
- **Lưu trữ token**:
  - Sử dụng **cookies** và `localStorage.
- **Kiểm tra token**:
  - Gọi `checktoken()` => nếu sai => popup yêu cầu re-login.
- **Đăng xuất**:
  - Gọi `this.authService.logout()` => xóa token => dispatch store => reload.

---

### 5.3. Đăng ký Moderator

**Tệp chính liên quan**:

- **Service**: [`auth.service.ts`](./src/app/services/api-service/auth.service.ts)
- **Popup**: [`reg-moderator.component.ts`](./src/app/components/popup-form/reg-moderator/reg-moderator.component.ts)

**Tính năng**:

- **Guest** yêu cầu Moderator => tạo user => gửi request => chờ Admin duyệt.
- **User** => cung cấp CCCD, phone => gửi request => chờ Admin duyệt.

---

### 5.4. Quản lý Account & Upload Avatar/Background

**Tệp chính liên quan**:

- **UserProfile**: [`user-profile.component.ts`](./src/app/components/multi-structure/user-profile/user-profile.component.ts)
- **EditInfoAccount**: [`edit-info-account.component.ts`](./src/app/components/popup-form/edit-info-account/edit-info-account.component.ts)
- **Service**: [`auth.service.ts`](./src/app/services/api-service/auth.service.ts)

**Tính năng**:

- **Xem thông tin tài khoản**: `UserProfileComponent`.
- **Cập nhật avatar**: `uploadAvatar()`.
- **Cập nhật background**: `uploadBackground()`.
- **Cập nhật thông tin cơ bản**: `EditInfoAccountComponent`.

---

### 5.5. Trang Home, Lọc danh sách phim, Xem chi tiết phim

**Tệp chính liên quan**:

- **Home**: [`home.component.ts`](./src/app/pages/home/home.component.ts)
- **Chi tiết phim**: [`film-details.component.ts`](./src/app/pages/film-details/film-details.component.ts)
- **Play page**: [`play-page.component.ts`](./src/app/pages/play-page/play-page.component.ts)
- **Tìm kiếm**: (header search => `list-search.component.ts` => gọi service `postMovieItemSearch`)

**Tính năng**:

- Trang chủ hiển thị danh sách anime (nhiều “category”), top view, ...
- Trang chi tiết phim: hiển thị thông tin (title, poster, rating, …).
- Trang xem phim: nhúng player YouTube.
- Tìm kiếm: gõ text => hiển thị gợi ý, gọi API.

---

### 5.6. Quản lý Notification (Thông báo)

**Tệp chính liên quan**:

- **NotificationList**: [`list-notifications.component.ts`](./src/app/components/layout/list-notifications/list-notifications.component.ts)
- **NgRx**: [`notification.reducer.ts`, `notification.action.ts`, …]

**Tính năng**:

- Hiển thị danh sách thông báo (`INotice`) trong header.
- Đánh dấu tất cả đã đọc, đánh dấu 1 thông báo đã đọc.
- Popup notification (`alert-notification.component.ts`) cho event như đăng ký thành công, lỗi, v.v.

---

### 5.7. Popup & Form State

**Tệp chính liên quan**:

- **NgRx**:
  - [`form.actions.ts`](./src/app/store/open-form-state/form.actions.ts)
  - [`form.reducer.ts`](./src/app/store/open-form-state/form.reducer.ts)

**Tính năng**:

- Lưu trạng thái popup đang mở (login, register, warning, …).
- Dễ dàng bật/tắt popup => `openForm(...)` / `closeForm(...)`.

---

### 5.8. Cấu hình API & Service

**Tệp chính liên quan**:

- [`api.service.ts`](./src/app/services/config-service/api.service.ts)
- [`config.ts`](./src/app/services/config-service/config.ts)

**Tính năng**:

- Chứa `API_CONFIG` với `BASE_URLS` (MAIN_API, SECONDARY_API).
- Gồm hàm GET, POST, PUT, DELETE,... chung, tự động thêm `Bearer token`.
- Hàm upload file, get Blob,...

---

## 6. Cách chạy dự án

1. **Cài đặt dependencies**:
   ```bash
   npm install
   ```
2. **Chạy dự án** (development):
   ```bash
   npm start
   ```
   - Mặc định chạy tại [http://localhost:4200](http://localhost:4200)
3. **Build production**:
   ```bash
   npm run build
   ```
   - Tạo folder `dist/init_code_fe`.

---

## 7. Kiểm thử

- **Unit Test**:
  ```bash
  npm test
  ```
- **E2E Test**: Sử dụng tool Selenium
- **Mock API**: có thể dùng `json-server` (trong devDependencies) cho `localhost:3000` (thông tin trong code).

---

## 8. Đóng góp - Phát triển

- **Issues**: Mở issues để thông báo lỗi hoặc yêu cầu tính năng.
- **Pull Request**: Tạo PR vào branch `develop`.

---

## 9. Thông tin liên hệ

- **Tác giả**:
  - Tô Quang Đức
- **Email**:
  - toquangduc2004@gmail.com

---

> **Ghi chú**: Tài liệu này mô tả **trạng thái hiện tại** của Frontend AnimeH. Một số phần đang tiếp tục được phát triển (comment, rating, payment, …). Vui lòng xem chi tiết code hoặc liên hệ tác giả để biết thêm.
