import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../api.service';
import { KotakWebSocketService } from '../services/kotak-websocket.service';
import { Subscription } from 'rxjs';
import { ExpiryData, LiveData, OptionData, PresentIndexData } from '../model/option-data.model';
import { StringToNumberPipe } from '../pipes/string-to-number.pipe';
import { ScripMasterService } from '../services/scrip-master.service';
import { Subject,Observable } from 'rxjs';
import { MatTableDataSource,MatTableModule  } from '@angular/material/table';



@Component({
  selector: 'app-option-chain',
  standalone: true,
  templateUrl: './option-chain.component.html',
  styleUrls: ['./option-chain.component.css'],
  imports: [CommonModule, StringToNumberPipe,MatTableModule,],
})
export class OptionChainComponent implements OnInit {
  displayedColumns: string[] = ['volume', 'oi', 'oiChg', 'ltpChg', 'ltp', 'strikePrice'];
  token: string = '';
  data: any = null;
  strikePrice: number = 0; // Initialize with a default value
  readableDate: string = ''; // Initialize with a default value
  indexToken: string = ''; // Initialize with a default value
  stringToNumber = StringToNumberPipe;
  sid: string = '';
  ivValue: number = NaN; // Holds the value of iv to compare with strike price
  tolerance: number = 50; // Define your tolerance level here
  optionsData: OptionData[] = [];
  presentIndexData: PresentIndexData[] = [];
  sortedStrikePrices: number[] = [];
  expiryDates: string[] = [];
  selectedExpiry: any;
  selectedScript: any;
  private fetchInterval: any;
  private wsSubscription: Subscription | null = null;
  subIndices: string = 'nse_cm|Nifty Bank';
  subOptions: string = 'nse_fo|43100';
  scriptMap: { [key: string]: string } = {
    "BANKNIFTY": "Nifty Bank",
    "NIFTY": "Nifty 50",
    "FINNIFTY": "FIN NIFTY"
  };
  scriptList: string[] = Object.keys(this.scriptMap);
  public scriptData: any[] = [];
  private liveDataSubject = new Subject<LiveData[]>();
  liveData$: Observable<LiveData[]> = this.liveDataSubject.asObservable();
  count = 20; // Number of numbers before and after the target number
  step = 100; // Step size
  strikePriceResult: number[] = [];
  pSymbol :string[]=[];


  constructor(private apiService: ApiService,
    private wsService: KotakWebSocketService,
    private ScripMasterService: ScripMasterService
  ) { }

  ngOnInit(): void {
    this.token = localStorage.getItem('token') || '';
    this.sid = localStorage.getItem('sid') || '';
    this.selectedScript = this.scriptList[0];
    this.fetchExpiryDates();
      this.setupWebSocket();
      this.strikePriceChangesDectection();
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
    const symbol = this.selectedScript;
    if (!symbol || symbol.trim() === '') {
      console.error('Selected symbol is empty or invalid.');
      return; // Exit the method early if the symbol is invalid
    }
    this.apiService.expiryDates(symbol)
      .then(data => {
        this.expiryDates = data.data.map((item: ExpiryData) => item.readableExpiryDate);
        if (this.expiryDates.length > 0) {
          this.selectedExpiry = this.expiryDates[0];
          // this.loadScripMaster();
          this.fetchOptionChainData();
        }
      })
      .catch(error => {
        console.error('Error fetching option chain data', error);
      });
  }


  // Function to convert epoch timestamp to IST
  expiryDataConvertion(epoch: number) {// Example epoch time (in milliseconds)
    const epochs = 315513000 + epoch;
   // console.log("epoepochsch",epochs)
    var date = new Date(epochs * 1000);
    //var timeDifference = 52200;
    // Define options for the desired format with correct string literals
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    // Convert the date to the desired format
    const formattedDate = date.toLocaleDateString('en-GB', options).replace(/\s/g, '-');

    //console.log("formattedDate",formattedDate); // Output: 24-Mar-2024
     // const epochTimeInSecondsdate =new Date(formattedDate);
   // const epochTimeInSeconds = Math.floor(epochTimeInSecondsdate.getTime() / 1000);
   // var newEpoch = epochs + timeDifference;

   // var data = new Date(newEpoch * 1000);
   // console.log("data",data)
   // console.log("epochTimeInSeconds",epochTimeInSeconds); // Output will be the epoch time for 25-Sept-2024

   // console.log(epochTimeInSeconds);
    return formattedDate;
  }


  fetchOptionChainData(): void {
    const expiryDate = this.selectedExpiry;
    if (!expiryDate || expiryDate.trim() === '') {
      console.error('Selected Expiry Date is empty or invalid.');
      return; // Exit the method early if the expiryDate is invalid
    }
    this.ScripMasterService.getAllScriptData().subscribe(data => {
      //this.updateData(data);
      this.scriptData = data;
      this.pSymbol =this.scriptData.map((item: any) => {
        // Convert lExpiryDate (assuming it's in seconds)
        const lExpiryDate="lExpiryDate "
        const expiryDate = this.expiryDataConvertion(+item[lExpiryDate])// Adjust with the 315513000 offset
        //console.log('this.pSymbol ', expiryDate);
        return {
          ...item,
          lExpiryDate: expiryDate // Convert to local date string
        };
      });
       //console.log('Script Data:', this.scriptData);
       console.log('this.pSymbol ', this.pSymbol);
      // Current time in epoch seconds
    });
    //this.apiService.optionchain(this.selectedScript, expiryDate)
    //  .then(data => {
     //   this.optionsData = data.data;
        // Convert to percentage
        // console.log("this.optionsData",this.optionsData)
        // this.optionsData = this.optionsData.map(option => ({
        //   ...option,
        //   CallOIPerChg: this.convertToPercentage(option.CallOIPerChg),
        //   PutOIPerChg: this.convertToPercentage(option.PutOIPerChg),
        //   CallPricePerChange: this.convertToPercentage(option.CallPricePerChange),
        //   PutPriceperChange: this.convertToPercentage(option.PutPriceperChange)
        // }));
       // this.sortStrikePrices(); // Sort data after fetching
        //this.setupFetchInterval()
        
      // })
      // .catch(error => {
      //   console.error('Error fetching option chain data', error);
      // });
   


  }

  sortStrikePrices(): void {
    // Extract the strikeprice values
    this.sortedStrikePrices = this.optionsData
      .map(option => parseInt(option.strikeprice, 10))
      .sort((a, b) => b - a); // Sort in descending order
  }

  setupFetchInterval(): void {
    this.fetchInterval = setInterval(() => {
      this.fetchOptionChainData();
    }, 2000); // 2000 milliseconds = 2 seconds
  }


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
    if (expiryInput) {
      expiryInput.value = expiryDate;
      this.fetchOptionChainData();
    }
  }

  setExpiryDate(expiry: string): void {
    console.log("clicked on setExpiryDate")
    this.selectedExpiry = expiry;
    this.fetchOptionChainData()
    // Perform any additional actions needed when an expiry date is selected
  }
  setScriptType(script: string): void {
    console.log("clicked on setScriptType")
    this.selectedScript = script;
    this.fetchExpiryDates();
    this.fetchOptionChainData();
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

        this.wsService.connectHsi(this.token, this.sid, 'handshakeServerId', (msg: MessageEvent) => {
          this.handleWebSocketMessage(msg);
        });
        // For example, subscribe to a specific scrip  opc for options
        this.wsService.sendMessageToUserWS({
          type: 'ifs',
          scrips: this.subIndices,
          channelnum: '1'
        });
        this.wsService.sendMessageToUserWS({
          type: 'mws',
          scrips: this.subOptions,
          channelnum: '2'
        });
      })
      .catch((error) => {
        console.error('Failed to load script:', error);
      });
  }

  handleWebSocketMessage(message: MessageEvent): void {
    try {
      const data = message.data as string;
      const jsonString = JSON.stringify(message);
      const decodedString = JSON.parse(jsonString);
      const dataArray = JSON.parse(decodedString);
     // console.log('Message data type dataArray:', dataArray);
      if (Array.isArray(dataArray) && dataArray[0]?.iv) {
        this.presentIndexData = [dataArray[0]]; // Set presentIndexData with the received data
        // Trigger detection to apply class or scroll
        this.ivValue = parseFloat(dataArray[0]?.iv);
        console.log("this.ivValue",this.ivValue)
        this.simulateRealTimeChange(this.ivValue);
        this.scrollToIvStrikePrice();
      } else if(Array.isArray(dataArray) && dataArray[0]?.ltp) {
        this.liveDataSubject.next(dataArray);
      }
      else {
        this.liveDataSubject.next([]);
        this.presentIndexData = []; // Fallback to an empty array
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message data:', error);
      this.liveDataSubject.next([]);
      this.presentIndexData = []; // Ensure presentIndexData is not undefined
    }
  }
  // Get the display name for a given script
  getDisplayName(script: string): string {
    return this.scriptMap[script] || script;
  }
  isWithinTolerance(value: number, target: number, tolerance: number): boolean {
    return Math.abs(value - target) <= tolerance;
  }

  scrollToIvStrikePrice(): void {
    setTimeout(() => {
      const rows = document.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const strikePriceCell = row.querySelector('td:nth-child(6)'); // Adjust the index based on your table
        if (strikePriceCell) {
          const strikePrice = parseFloat(strikePriceCell.textContent || '0');
          if (this.isWithinTolerance(strikePrice, this.ivValue, this.tolerance)) {
            row.classList.add('table-danger');
            //row.style.backgroundColor = 'yellow'; // Apply inline style directly
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            // row.style.backgroundColor = '';
            row.classList.remove('table-danger');
          }
        }
      });
    }, 0); // Delay to ensure the DOM is updated
  }

  updateData(newData: any[]): void {
    this.ScripMasterService.setAllScriptData(newData);
  }

  simulateRealTimeChange(newTarget: number) {
    this.ScripMasterService.updateTargetNumber(newTarget);
  }
  strikePriceChangesDectection (){
     // Subscribe to targetNumber updates
     this.ScripMasterService.targetNumber$.subscribe(targetNumber => {
      this.strikePriceResult = this.ScripMasterService.generateNumberSequence(targetNumber, this.count, this.step);
      console.log("strikePriceChangesDectection",this.strikePriceResult);
    });
  }

}
