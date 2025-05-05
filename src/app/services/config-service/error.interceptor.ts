import { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { INotification } from '../../models/InterfaceData';
import { addNotification } from '../../store/notification/notification.action';

// Bản đồ lỗi từ mã lỗi API sang thông báo tiếng Việt
const ERROR_MESSAGES: Record<number, string> = {
  99999: 'Lỗi không xác định. Vui lòng thử lại!',
  10001: 'Khóa không hợp lệ!',

  40001: 'Tên người dùng không hợp lệ!',
  40002: 'Mật khẩu không hợp lệ!',
  40003: 'Email không hợp lệ!',
  40004: 'Vui lòng nhập tên người dùng!',
  40005: 'Vui lòng nhập mật khẩu!',
  40006: 'Vui lòng nhập email!',
  40007: 'Tên đăng nhập hoặc mật khẩu không đúng!',
  40008: 'Trạng thái yêu cầu không hợp lệ!',
  40009: 'Thông tin xác thực không hợp lệ!',
  40010: 'Thiếu token!',
  40011: 'Token không hợp lệ!',
  40012: 'Token đã hết hạn!',
  40013: 'Token đã được sử dụng!',
  40014: 'Trạng thái pending không hợp lệ!',
  40015: 'Trạng thái approved không hợp lệ!',
  40016: 'Trạng thái rejected không hợp lệ!',
  40017: 'Trạng thái không hợp lệ!',
  40018: 'Không thể xóa các tệp bên trong!',
  40019: 'Chữ ký mã token không hợp lệ!',
  40020: 'Số tập không hợp lệ!',
  40021: 'Trạng thái cập nhật không hợp lệ',
  40022: 'Giá trị đánh giá không hợp lệ',
  40023: 'Ngày cập nhật không hợp lệ',
  40024: 'Lỗi định dạng ảnh',
  40025: 'Tên file không hợp lệ',
  40026: 'Mức GP không hợp lệ',
  40027: 'Không đủ GP để thực hiện thao tác',

  40101: 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn!',

  40301: 'Bạn không có quyền thực hiện hành động này!',
  40302: 'Bạn không có quyền tải lên file GIF!',

  40401: 'Không tìm thấy người dùng!',
  40402: 'Không tìm thấy vai trò!',
  40403: 'Không tìm thấy yêu cầu!',
  40404: 'Không tìm thấy tập phim!',
  40405: 'Không tìm thấy anime!',
  40406: 'Không tìm thấy tập phim!',
  40407: 'Không tìm thấy series anime!',
  40408: 'Không tìm thấy loại này!',
  40409: 'Không tìm thấy bình luận!',
  40410: 'Không tìm thấy lịch sử phim!',
  40411: 'Không tìm thấy lịch',
  40412: 'Không tìm thấy sản phẩm',
  40413: 'Không tìm thấy thông báo',
  40414: 'Không tìm thấy lịch sử thanh toán',

  40901: 'Người dùng đã tồn tại!',
  40902: 'Email đã được sử dụng!',
  40903: 'Loại đã tồn tại!',
  40904: 'Anime với loại này đã tồn tại!',
  40905: 'Tên tập phim này đã trùng với tập phim đang phát hành ',

  50000: 'Gửi email thất bại!',
  50001: 'Đọc thư mục thất bại!',
  50002: 'Xóa tệp thất bại!',
  50003: 'Xử lý ffmpeg thất bại!',
  50004: 'Lỗi xác thực token!',
  50005: 'Lỗi tạo token JWT!',
  50006: 'Lỗi đánh dấu đã đọc!',
  50007: 'Lỗi đếm thông báo đã đọc!',
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(Store);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Mặc định lấy HTTP status code và status text
      let errorCode = error.status;
      let errorMessage = 'Không thể kết nối tới máy chủ!';
      const errorStatus = `${error.status} ${error.statusText}`;

      // Nếu lỗi có response body là object, lấy code và message từ đó
      if (error.error && typeof error.error === 'object') {
        console.log(error.error);
        errorCode = error.error.code || error.status;
        errorMessage =
          ERROR_MESSAGES[errorCode] || error.error.message || errorMessage;
      }

      // Gửi thông báo lỗi với NgRx Store
      const notification: INotification = {
        id: Date.now().toString(),
        title: 'Lỗi',
        message: errorMessage,
        type: 'error',
        timestamp: new Date(),
      };
      store.dispatch(addNotification({ notification }));

      // Trả về lỗi với cấu trúc: { code, message, status }
      return throwError(() => ({
        code: errorCode,
        message: errorMessage,
        status: errorStatus,
      }));
    })
  );
};
