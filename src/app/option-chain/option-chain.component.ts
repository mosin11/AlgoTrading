import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ApiService } from '../api.service';
import { KotakWebSocketService } from '../services/kotak-websocket.service';
import { Subscription } from 'rxjs';

interface OptionData {
  symbol: string;
  expdate: string;
  strikeprice: string;
  CallBestBuyQty: string;
  CallBestSellQty: string;
  CallLTP: string;
  CallOI: string;
  CallOIPerChg: string;
  CallOI_Prev: string;
  CallPricePerChange: string;
  CallVolume: string;
  PutBestBuyQty: string;
  PutBestSellQty: string;
  PutLTP: string;
  PutOI: string;
  PutOIPerChg: string;
  PutOI_Prev: string;
  PutPriceperChange: string;
  PutStrikeprice: string;
  PutVolume: string;
  Putbestbuyprice: string;
  Putbestsellprice: string;
  callbestbuyprice: string;
  callbestsellprice: string;
}
interface ExpiryData {
  instType: string;
  readableExpiryDate: string;
  symbol: string;
  strikePrice: string;
}

@Component({
  selector: 'app-option-chain',
  standalone: true, 
  templateUrl: './option-chain.component.html',
  styleUrls: ['./option-chain.component.css'],
  imports: [CommonModule],
})
export class OptionChainComponent implements OnInit {
  token: string = '';
  sid: string = '';
  optionsData: OptionData[] = [];
  expiryDates: string[] = [];
  selectedExpiry: any;
  private fetchInterval: any;
  private wsSubscription: Subscription | null = null;
  subIndices: string = 'nse_cm|Nifty Bank';

  constructor(private apiService: ApiService,
    private wsService: KotakWebSocketService) { }

  ngOnInit(): void {

    this.token = localStorage.getItem('token') || '';
    this.sid = localStorage.getItem('sid') || '';

    this.fetchExpiryDates();
    // this.setupFetchInterval();
    this.setupWebSocket();


  }

  ngOnDestroy(): void {
    if (this.fetchInterval) {
      clearInterval(this.fetchInterval);
    }
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }

  fetchExpiryDates(): void {
      const symbol = 'BANKNIFTY';
    this.apiService.expiryDates(symbol)
      .then(data => {
        this.expiryDates = data.data.map((item: ExpiryData) => item.readableExpiryDate);
        if (this.expiryDates.length > 0) {
          this.selectedExpiry = this.expiryDates[0];
          this.fetchOptionChainData();
        }})
      .catch(error => {
        console.error('Error fetching option chain data', error);
      });
  }

  fetchOptionChainData(): void {  
    const symbol = 'BANKNIFTY';
    const expiryDate = this.selectedExpiry;
    this.apiService.optionchain(symbol, expiryDate)
      .then(data => {
        this.optionsData = data.data;
         // Convert to percentage
        // console.log("this.optionsData",this.optionsData)
         this.optionsData = this.optionsData.map(option => ({
          ...option,
          CallOIPerChg: this.convertToPercentage(option.CallOIPerChg),
          PutOIPerChg: this.convertToPercentage(option.PutOIPerChg),
          CallPricePerChange: this.convertToPercentage(option.CallPricePerChange),
          PutPriceperChange: this.convertToPercentage(option.PutPriceperChange)
        }));
      })
      .catch(error => {
        console.error('Error fetching option chain data', error);
      });
  }


  // setupFetchInterval(): void {
  //   this.fetchInterval = setInterval(() => {
  //     this.fetchOptionChainData();
  //   }, 2000); // 2000 milliseconds = 2 seconds
  // }


  convertToPercentage(value: string): string {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) {
      return 'N/A';
    }
    return (numericValue).toFixed(2) + '%';
  }


  selectExpiry(expiryDate: string): void {
    this.selectedExpiry = expiryDate;
    const expiryInput = document.getElementById('expiryDropdownInput') as HTMLInputElement;
    if (expiryInput) {debugger
      expiryInput.value = expiryDate;
    }
  }

  setExpiryDate(expiry: string): void {
    this.selectedExpiry = expiry;
    this.fetchOptionChainData()
    // Perform any additional actions needed when an expiry date is selected
}

setupWebSocket(): void {
  this.wsService.loadScript('assets/hslib.js')
    .then(() => {
      // Ensure HSWebSocket is available before using it
      if (typeof HSWebSocket === 'undefined') {
        console.error('HSWebSocket is not defined. Check if hslib.js is loaded properly.');
        return;
      }

      // Connect to WebSocket and handle messages
      this.wsService.connectHsm(this.token, this.sid, (msg: MessageEvent) => {
        // Process incoming WebSocket messages
        this.handleWebSocketMessage(msg);
      });

      // For example, subscribe to a specific scrip
      this.wsService.sendMessageToUserWS({
        type: 'ifs',
        scrips: this.subIndices,
        channelnum: '1'
      });
    })
    .catch((error) => {
      console.error('Failed to load script:', error);
    });
}

handleWebSocketMessage(message: any): void {
  const parsedMessage = JSON.parse(message);
  // Handle the WebSocket message and update the component state
 // console.log('Handling WebSocket message:', parsedMessage);
  
  // You can update `optionsData` or other state variables here 
}






}
