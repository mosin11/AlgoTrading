import { Injectable } from '@angular/core';
import { CsvProcessingServiceService } from './csv-processing-service.service';
import { from, of, Observable, BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ScripMasterService {

  private fileBasePathUrl = "https://gw-napi.kotaksecurities.com/Files/1.0/masterscrip/v1/file-paths"; // Assuming you have a base URL in your environment files
  private bearerToken = localStorage.getItem('token') || ''; // Assuming you have a token in your environment files
  data: any[] = [];
  constructor(private csvProcessingServiceService: CsvProcessingServiceService) { }
  ScriptFilesPaths: any[] = [];
  nseCMAndnseFOScriptPath: any[] = [];
  private allScriptDataSubject = new BehaviorSubject<any[]>([]);
  public allScriptData$ = this.allScriptDataSubject.asObservable();
  private targetNumberSubject = new BehaviorSubject<number>(50000);
  targetNumber$ = this.targetNumberSubject.asObservable();

  private normalizeSegmentName(segment: string): string {
    const segmentMapping: { [key: string]: string } = {
      'BANKNIFTY': 'NiftyBank',
      'NIFTY': 'Nifty 50',
      'FINNIFTY': 'Nifty Fin Service'
    };
    return segmentMapping[segment.toUpperCase()] || segment;
  }


  private getExchangeSegmentKeys(exchangeSegment: string): string[] {
    const normalizedSegment = this.normalizeSegmentName(exchangeSegment);
    const exchangeSegmentMapping: { [key: string]: string[] } = {
      'Nifty 50': ['nse_fo', 'nse_cm'],
      'NiftyBank': ['nse_fo', 'nse_cm'],
      'Nifty Fin Service': ['nse_cm'],
      'SENSEX': ['bse_cm'],
      'INDIA VIX': ['nse_cm']
    };
    return exchangeSegmentMapping[normalizedSegment] || [normalizedSegment];
  }

  formatTokensLive(instrumentTokens: any): string {
    let scrips = '';

    if (typeof instrumentTokens === 'object' && 'exchange_segment' in instrumentTokens && 'instrument_token' in instrumentTokens) {
      scrips += `${instrumentTokens.exchange_segment}|${instrumentTokens.instrument_token}`;
    }

    return scrips;
  }

  async scripMasterInit(exchangeSegment?: string): Promise<any> {
    const url = `${this.fileBasePathUrl}`;
    const headers = {
      'Authorization': `Bearer ${this.bearerToken}`,
      'Content-Type': 'application/json'
    };

    try {
      const response = await fetch(url, { method: 'GET', headers });
      const data = await response.json();
      //console.log("main script data", data);
      const scripReport = data.data;
      this.ScriptFilesPaths = data.data.filesPaths;
      //Script Data:console.log("ScriptFilesPaths",this.ScriptFilesPaths)
      if (exchangeSegment) {
        const exchangeSegmentKey = this.getExchangeSegmentKeys(exchangeSegment);
        const matchingFiles = scripReport.filesPaths.filter((file: string) =>
          exchangeSegmentKey.some(key => file.toLowerCase().includes(key.toLowerCase()))
        );
        //const processedData = this.csvProcessingServiceService.processCsvUrls(matchingFiles);
        console.time("processCsvUrls process time:");
        this.nseCMAndnseFOScriptPath = matchingFiles;
        this.csvProcessingServiceService.processCsvUrls(matchingFiles).subscribe({
          next: results => {
            this.setAllScriptData(results);
            // console.log('Results:', this.allScriptData);
            // Handle the results here
          },
          error: err => console.error('Error:', err),
          complete: () => console.log('Completed processing URLs')
        });
        console.timeEnd("processCsvUrls process time:");


        // if (matchingFiles.length > 0) {
        //   this.nseCMAndnseFOScriptPath =matchingFiles;
        //   fetch(`${this.BASE_URL}/data/process-csv`, {
        //     method: 'POST',
        //     headers: headers,
        //     body: JSON.stringify(matchingFiles) // Convert the JavaScript object to a JSON string
        //   })
        //     .then(response => response.json())
        //     .then(data => {
        //       console.log('Success:', data);
        //     })
        //     .catch((error) => {
        //       console.error('Error:', error);
        //     });
        //   //return this.fetchAndParseCsv(matchingFiles); // Return all matching files
        //   return "" // Return all matching files
        // } else {
        //   return { Error: 'Exchange segment not found' }; // Return an error if no files were found
        // }
      }
      return scripReport;
    } catch (error) {
      return { error };
    }
  }


  // Convert epoch to readable date based on segment
  convertToReadableDate(epochTime: number, segment: string): string {
    if (segment === 'nse_fo' || segment === 'cde_fo') {
      epochTime += 315513000; // Add seconds to epoch time
    }
    const date = new Date(epochTime * 1000); // Convert epoch to milliseconds
    return date.toLocaleString(); // Convert to readable date
  }

  // Handle strike price calculation
  calculateStrikePrice(dStrikePrice: number): number {
    return dStrikePrice / 100;
  }
  // Method to parse CSV text
  //  private parseCsv(csvText: string): void {
  //   Papa.parse(csvText, {
  //     header: true,
  //     skipEmptyLines: true,
  //     complete: (result) => {
  //       this.data = result.data;
  //       console.log('Parsed CSV Data:', this.data);
  //     },
  //     error: () => {
  //       console.error('Error parsing CSV:');
  //     }
  //   });
  // }

  setAllScriptData(data: any[]): void {
    console.log("setAllScriptData ",data)
    this.allScriptDataSubject.next(data);
  }

  // Method to get allScriptData as an observable
  getAllScriptData(): Observable<any[]> {
    return this.allScriptData$;
  }

  // Method to generate numbers around a target number
  // Method to generate numbers around a target number with error handling
  generateNumberSequence(targetNumber: number | null | undefined, count: number | null | undefined, step: number | null | undefined): number[] {
    // Initialize the result array
    const numbers: number[] = [];
    // Check for invalid inputs
    if (targetNumber === null || targetNumber === undefined || typeof targetNumber !== 'number') {
      console.error('Invalid targetNumber: Must be a number.');
      return numbers;
    }
    if (count === null || count === undefined || typeof count !== 'number' || count < 0) {
      console.error('Invalid count: Must be a non-negative number.');
      return numbers;
    }
    if (step === null || step === undefined || typeof step !== 'number' || step <= 0) {
      console.error('Invalid step: Must be a positive number.');
      return numbers;
    }
    // Generate numbers before the target number
    const nearTargetNumber = this.findNearestNumber(targetNumber,100);
    for (let i = 1; i <= count; i++) {
      numbers.push(nearTargetNumber - i * step);
    }
    // Add the target number itself
    numbers.push(nearTargetNumber);
    // Generate numbers after the target number
    for (let i = 1; i <= count; i++) {
      numbers.push(nearTargetNumber + i * step);
    }
    return numbers.sort((a, b) => a - b);
  }
  // Method to update target number
  updateTargetNumber(newTargetNumber: number) {
    console.log("object,newTargetNumber", newTargetNumber)
    this.targetNumberSubject.next(newTargetNumber);
  }

  findNearestNumber(value: number, multiple: number): number {
    const remainder = value % multiple;
    const halfMultiple = multiple / 2;
  
    if (remainder === 0) {
      return value; // The number is already a multiple
    }
  
    if (remainder > halfMultiple) {
      return value + (multiple - remainder); // Round up
    } else {
      return value - remainder; // Round down
    }
  }





}
