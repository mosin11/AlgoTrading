import { Component, OnInit } from '@angular/core';
import { TradeService } from '../services/trade.service';

@Component({
  selector: 'app-trade-management',
  templateUrl: './trade-management.component.html',
  styleUrls: ['./trade-management.component.css']
})
export class TradeManagementComponent implements OnInit {
  trades: any[] = [];

  constructor(private tradeService: TradeService) { }

  ngOnInit(): void {
    this.tradeService.getTrades().subscribe(trades => {
      this.trades = trades;
    });
  }
}
