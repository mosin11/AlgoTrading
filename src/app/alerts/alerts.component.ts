import { Component, OnInit } from '@angular/core';
import { AlertService } from '../services/alert.service';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.css']
})
export class AlertsComponent implements OnInit {
  alerts: { type: string, message: string }[] = [];

  constructor(private alertService: AlertService) { }

  ngOnInit(): void {
    this.alertService.getAlerts().subscribe(alerts => {
      this.alerts = alerts;
    });
  }
}
