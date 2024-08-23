import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket = io('https://your-kotak-socket-url');
  private dataSubject = new Subject<any>();

  constructor() {
    this.socket.on('real-time-data', (data: any) => {
      this.dataSubject.next(data);
    });
  }

  getRealTimeData() {
    return this.dataSubject.asObservable();
  }
}
