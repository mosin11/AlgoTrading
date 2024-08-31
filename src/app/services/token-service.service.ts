import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenServiceService {

  private readonly LAST_CLEAR_DATE_KEY = 'lastClearDate';
  private readonly TOKEN_KEY = 'token';
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly AUTH_TOKEN_KEY = 'authToken';
  private readonly SID_KEY = 'sid';
  private readonly RID_KEY = 'rid';

  constructor() { }

  setLastClearDate(date: string): void {
    localStorage.setItem(this.LAST_CLEAR_DATE_KEY, date);
  }

  getLastClearDate(): string | null {
    return localStorage.getItem(this.LAST_CLEAR_DATE_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setAccessToken(accessToken: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  setAuthToken(authToken: string): void {
    localStorage.setItem(this.AUTH_TOKEN_KEY, authToken);
  }

  getAuthToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }

  setSid(sid: string): void {
    localStorage.setItem(this.SID_KEY, sid);
  }

  getSid(): string | null {
    return localStorage.getItem(this.SID_KEY);
  }

  setRid(rid: string): void {
    localStorage.setItem(this.RID_KEY, rid);
  }

  getRid(): string | null {
    return localStorage.getItem(this.RID_KEY);
  }



  clearTokens() {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('sid');
    localStorage.removeItem('rid');
  }
}

