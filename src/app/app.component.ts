import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { INotification } from './models/InterfaceData';
import { Store } from '@ngrx/store';
import { selectNotifications } from './store/notification/notification.selector';
import { removeNotification } from './store/notification/notification.action';
import { AlertNotificationComponent } from './components/regular/alert-notification/alert-notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterModule,
    CommonModule,
    AlertNotificationComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  notifications$: Observable<INotification[]>;

  constructor(private store: Store) {
    this.notifications$ = this.store.select(selectNotifications);
  }

  // Xóa thông báo theo ID
  removeNotification(id: string) {
    this.store.dispatch(removeNotification({ id }));
  }
}
