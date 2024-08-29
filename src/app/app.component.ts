import { Component,HostListener ,OnInit  } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import jwtDecode from 'jwt-decode';
import { ScripMasterService } from './services/scrip-master.service';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet,],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'AlgoTrading';
  
  constructor(
    private scripMasterService: ScripMasterService
  ) { }
  ngOnInit() {
    this.clearLocalStorageOnceDaily();
    this.checkTokenExpiration();
    this.loadScripMaster();
  }
  clearLocalStorageOnceDaily() {
    const lastClear = localStorage.getItem('lastClearDate');
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    if (lastClear !== today) {
      localStorage.clear(); // Clear local storage
      localStorage.setItem('lastClearDate', today); // Store today's date as last clear date
    }
  }

  checkTokenExpiration() {
    const token = localStorage.getItem('authToken');
    const tokenExpiration = localStorage.getItem('tokenExpiration');

    if (token && tokenExpiration) {
      const expirationDate = parseInt(tokenExpiration, 10);
      const currentDate = new Date().getTime();

      if (currentDate > expirationDate) {
        localStorage.clear(); // Clear local storage if token is expired
      }
    }
  }

  
  async loadScripMaster() {
    try {
      const data = await this.scripMasterService.scripMasterInit("NiftyBank");
      //console.log('Scrip Master Data:', data);
      //this.fetchOptionChainData();
    } catch (error) {
      console.error('Error:', error);
    }
  }

}
