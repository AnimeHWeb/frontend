import { createAction, props } from '@ngrx/store';
import { INotification } from '../../models/InterfaceData';

// ✅ Thêm thông báo
export const addNotification = createAction(
  '[Notification] Add',
  props<{ notification: INotification }>()
);

// ✅ Xóa thông báo cụ thể theo id
export const removeNotification = createAction(
  '[Notification] Remove',
  props<{ id: string }>()
);

// ✅ Xóa tất cả thông báo
export const clearNotifications = createAction('[Notification] Clear All');
