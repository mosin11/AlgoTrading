import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TradeService {
  private apiUrl = 'https://your-api-url/trades';

  constructor(private http: HttpClient) { }

  getTrades(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}
