import { Component, OnInit } from '@angular/core';
import { SocketService } from '../services/socket.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone:true
})
export class DashboardComponent implements OnInit {
  currentPrice: number = 0;
  portfolioValue: number = 0;
  tradePerformance: number = 0;

  constructor(private socketService: SocketService) { }

  ngOnInit(): void {
    this.socketService.getRealTimeData().subscribe(data => {
      this.currentPrice = data.price;
      this.portfolioValue = data.portfolioValue;
      this.tradePerformance = data.tradePerformance;
    });
  }
}
