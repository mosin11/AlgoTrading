import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';
import * as Papa from 'papaparse';

@Injectable({
  providedIn: 'root'
})
export class ScripMasterService {
  private fileBasePathUrl = "https://gw-napi.kotaksecurities.com/Files/1.0/masterscrip/v1/file-paths"; // Assuming you have a base URL in your environment files
  private bearerToken = localStorage.getItem('token') || ''; // Assuming you have a token in your environment files
  data: any[] = [];
  constructor() { }

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
      console.log("main script data", data);
      const scripReport = data.data;
      if (exchangeSegment) {
        const exchangeSegmentKey = this.getExchangeSegmentKeys(exchangeSegment);
        const matchingFiles = scripReport.filesPaths.filter((file: string) =>
          exchangeSegmentKey.some(key => file.toLowerCase().includes(key.toLowerCase()))
        );
        if (matchingFiles.length > 0) {
          
          return this.fetchAndParseCsv(matchingFiles[1]); // Return all matching files
        } else {
          return { Error: 'Exchange segment not found' }; // Return an error if no files were found
        }
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
   private parseCsv(csvText: string): void {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        this.data = result.data;
        console.log('Parsed CSV Data:', this.data);
      },
      error: () => {
        console.error('Error parsing CSV:');
      }
    });
  }

 // Method to fetch and parse CSV from URL
async fetchAndParseCsv(url: string): Promise<any> {
  return fetch(url)
    .then(response => response.text())
    .then(csvText => {
      return this.parseCsv(csvText); // Assume parseCsv returns some result
    })
    .catch(error => {
      console.error('Error fetching CSV:', error);
      throw error; // Rethrow error to handle it where fetchAndParseCsv is called
    });
}


}
