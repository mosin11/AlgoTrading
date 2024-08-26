import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScripMasterService {
  private apiUrl = "https://gw-napi.kotaksecurities.com/Files/1.0/masterscrip/v1/file-paths"; // Assuming you have a base URL in your environment files
  private bearerToken =localStorage.getItem('token') || ''; // Assuming you have a token in your environment files

  constructor() { }


  formatTokensLive(instrumentTokens: any): string {
    let scrips = '';

    if (typeof instrumentTokens === 'object' && 'exchange_segment' in instrumentTokens && 'instrument_token' in instrumentTokens) {
      scrips += `${instrumentTokens.exchange_segment}|${instrumentTokens.instrument_token}`;
    }

    return scrips;
  }

  async scripMasterInit(exchangeSegment?: string): Promise<any> {
    const url = `${this.apiUrl}/scrip_master`;
    const headers = {
      'Authorization': `Bearer ${this.bearerToken}`,
      'Content-Type': 'application/json'
    };

    try {
      const response = await fetch(url, { method: 'GET', headers });
      const data = await response.json();
      console.log("main script data",data);
      const scripReport = data.data;
      if (exchangeSegment) {
        const exchangeSegmentKey = this.getExchangeSegmentKey(exchangeSegment);
        const exchangeSegmentCsv = scripReport.filesPaths.find((file: string) =>
          file.toLowerCase().includes(exchangeSegmentKey.toLowerCase())
        );
        return exchangeSegmentCsv ? exchangeSegmentCsv : { Error: 'Exchange segment not found' };
      }
      return scripReport;
    } catch (error) {
      return { error };
    }
  }

  private getExchangeSegmentKey(exchangeSegment: string): string {
    const exchangeSegmentMapping: { [key: string]: string } = {
      // Define your mappings here
    };
    return exchangeSegmentMapping[exchangeSegment] || exchangeSegment;
  }



}
