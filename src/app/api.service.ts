import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private BASE_URL="http://localhost:3000"
  private loginURL = `${this.BASE_URL}/api/authenticate`;
  private submitOTP = `${this.BASE_URL}/api/submitotp`;
  private optionchainURL = `${this.BASE_URL}/data/optionchain`;
  private expiryDatesURL = `${this.BASE_URL}/data/expirydates`;


  constructor(private http: HttpClient) {}

  authenticate(phoneNumber: string, password: string): Observable<any> {
    const body = { phoneNumber, password };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.loginURL, body, { headers });
  }

  verifyOtp(otp: string): Observable<any> {
    const token = localStorage.getItem("token");
    const sid = localStorage.getItem("sid");
    const accessToken = localStorage.getItem("accessToken");
    const body = { otp,token,sid,accessToken };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.submitOTP, body, { headers });
  }
  async optionchain(symbol: string, expirydate: string): Promise<any> {
    const token = localStorage.getItem("token");
    const sid = localStorage.getItem("sid");
    const accessToken = localStorage.getItem("accessToken");
  
    if (!this.isValidSymbol(symbol)) {
      console.error('Selected symbol in service is empty or invalid.');
      throw new Error('Invalid symbol');
    }
  
    if (!token || !sid || !accessToken) {
      console.error('Missing authentication information.');
      throw new Error('Missing authentication information');
    }
  
    const body = JSON.stringify({ symbol, expirydate, token, sid, accessToken });
  
    try {
      const response = await fetch(this.optionchainURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: body
      });
  
      if (!response.ok) {
        // Handle HTTP errors
        const errorText = await response.text();
        console.error('HTTP error:', response.status, errorText);
        throw new Error(`HTTP error: ${response.status}`);
      }
  
      // Assuming the response is JSON
      const data = await response.json();
      return data;
    } catch (error) {
      // Handle network or parsing errors
      console.error('Fetch error:', error);
      throw error;
    }
  }
  

  
  async expiryDates(symbol: string): Promise<any> {
    const token = localStorage.getItem("token");
    const sid = localStorage.getItem("sid");
    const accessToken = localStorage.getItem("accessToken");
    if (!this.isValidSymbol(symbol)) {
      console.error('Selected symbol in service is empty or invalid.');
      return Promise.reject('Invalid symbol');
    }
    const body = JSON.stringify({ symbol,  token, sid, accessToken });
   
    return fetch(this.expiryDatesURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body
    }).then(response => response.json());
  }


  private isValidSymbol(symbol?: string): boolean {
    return symbol !== undefined && symbol.trim() !== '';
  }

}
