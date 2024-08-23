import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSubject = new Subject<{ type: string, message: string }[]>();

  constructor() {
    // Simulate receiving alerts
    setInterval(() => {
      this.alertSubject.next([{ type: 'info', message: 'New trade signal!' }]);
    }, 5000);
  }

  getAlerts() {
    return this.alertSubject.asObservable();
  }
}
