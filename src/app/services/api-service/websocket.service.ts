import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import * as Stomp from 'stompjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private stompClient: Stomp.Client | null = null;
  private allNotificationsSubject = new Subject<{ topic: string; data: any }>();

  public allNotifications$: Observable<{ topic: string; data: any }> =
    this.allNotificationsSubject.asObservable();

  connect(): void {
    const socket = new WebSocket('ws://192.168.1.220:8081/animeh/api/ws');
    this.stompClient = Stomp.over(socket);
    this.stompClient.debug = () => {}; // tắt debug nếu muốn

    this.stompClient.connect(
      { login: '', passcode: '' },
      (frame: any) => {
        console.log('Đã kết nối socket:', frame);

        // Subscribe vào nhiều topic
        this.subscribeToAllTopic('/topic/anime');
        this.subscribeToAllTopic('/topic/episode');
        this.subscribeToAllTopic('/topic/comment');
      },
      (error) => {
        console.error('WebSocket connection error:', error);
      }
    );
  }

  private subscribeToAllTopic(topic: string): void {
    this.stompClient?.subscribe(topic, (message) => {
      if (message.body) {
        const data = JSON.parse(message.body);
        // Đính kèm thông tin topic nếu cần
        this.allNotificationsSubject.next({ topic, data });
      }
    });
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect(() => {
        console.log('Disconnected from WebSocket');
      });
    }
  }
}
