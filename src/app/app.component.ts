import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

import * as io from 'socket.io-client';
import {environment} from '../environments/environment';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private socket: any;
  public notifications: BehaviorSubject<Array<Notification>> = new BehaviorSubject<Array<Notification>>([]);

  public unread: number;

  constructor() {
    // @ts-ignore
    this.socket = io(environment.socketio, {
      path: '/socket.io'
    });
  }

  public notifications$(): Observable<Array<Notification>> {
    return this.notifications.asObservable();
  }

  public ngOnInit(): void {
    this.socket.on('notifications', notifications => {
      this.unread = notifications.data.filter(n => !n.read).length;
      this.notifications.next(notifications.data);
    });

    this.socket.on('notification', notification => {
      const notis = this.notifications.value;
      const newNotification: Notification = notification.data;
      notis.push(newNotification);
      this.unread = notis.filter(n => !n.read).length;
      this.notifications.next(notis);
    });
  }

  public markAsRead(noti) {
    const notis = this.notifications.value;
    const notification: Notification = notis.find(n => n.id === noti.id);
    notification.read = true;
    this.unread = notis.filter(n => !n.read).length;
    this.notifications.next(notis);
    this.socket.emit('event:mark-as-read', noti.id);
  }

}

interface Notification {
  id: string;
  message: string;
  read: boolean;
}
