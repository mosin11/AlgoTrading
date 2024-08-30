import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KotakWebSocketService } from '../services/kotak-websocket.service';
import { OptionChainComponent } from "../option-chain/option-chain.component";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, OptionChainComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent { 
  token: string = '';
  sid: string = '';
  handshakeServerId: string = '';
  channelNumber: string = '1';
  subScrips: string = 'nse_cm|11536&nse_cm|1594&nse_cm|3456';
  subIndices: string = 'nse_cm|Nifty 50&nse_cm|Nifty Realty';
  subDepth: string = 'nse_cm|11536&nse_cm|11000&nse_cm|11001';
  streamScrips: string = '';
  streamOrders: string = '';
  userId: string = '';
  userPassword: string = '';
  streamScrips1: string = '';

  constructor(private wsService: KotakWebSocketService) {}
 
  ngOnInit() {
    // Retrieve token and sid from localStorage on component initialization
    this.token = localStorage.getItem('token') || '';
    this.sid = localStorage.getItem('sid') || '';
  }

  wconnect(typeFunction: string) {
    if (typeFunction === 'Hsi') {
      this.wsService.connectHsi(this.token, this.sid, this.handshakeServerId, this.consoleLog1.bind(this));
    } else if (typeFunction === 'Hsm') {
      this.wsService.connectHsm(this.token, this.sid, this.consoleLog.bind(this));
    }
  }

  wsub(typeRequest: string, scrips: string) {
    const channelNumber = this.channelNumber;
    const scripsValue = (<HTMLInputElement>document.getElementById(scrips)).value;
    const jObj = { type: typeRequest, scrips: scripsValue, channelnum: channelNumber };

    this.wsService.sendMessageToUserWS(jObj);
  }

  consoleLog(msg: MessageEvent) {
    const d = new Date();
    this.streamScrips += `${d}\n${msg.data}\n\n`;
    console.log("this.streamScrips",this.streamScrips)
    const psconsole = document.getElementById('stream_scrips');
    if (psconsole) psconsole.scrollTop = psconsole.scrollHeight - psconsole.clientHeight;
  }

  consoleLog1(msg: MessageEvent) {
    const d = new Date();
    this.streamScrips1 += `${d}\n${msg.data}\n\n`;
    console.log("this.streamScrips1",this.streamScrips1)
    const psconsole = document.getElementById('stream_scrips1');
    if (psconsole) psconsole.scrollTop = psconsole.scrollHeight - psconsole.clientHeight;
  }


  subscribeToScrips() {
    const channelNumber = this.channelNumber;
    this.wsService.sendMessageToUserWS({
      type: 'mws',
      scrips: this.subScrips,
      channelnum: channelNumber
    });
  }

  subscribeToIndices() {
    const channelNumber = this.channelNumber;
    this.wsService.sendMessageToUserWS({
      type: 'ifs',
      scrips: this.subIndices,
      channelnum: channelNumber
    });
  }

  subscribeToDepth() {
    const channelNumber = this.channelNumber;
    this.wsService.sendMessageToUserWS({
      type: 'dps',
      scrips: this.subDepth,
      channelnum: channelNumber
    });
  }
  sendCommand(command: string, channel: string) {
    this.wsService.closeHsmConnection();
  }
  resumeChannel() {
    this.wsService.closeHsiConnection();
  }

}
