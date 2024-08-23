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


}
