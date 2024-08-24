
  import { Injectable, Inject, Renderer2, RendererFactory2 } from '@angular/core';
  import { DOCUMENT } from '@angular/common';


  @Injectable({
    providedIn: 'root'
  })
  export class KotakWebSocketService {
    private renderer: Renderer2;
    private userWS: HSWebSocket | null = null;
    private hsWs: WebSocket | null = null;
    private messageQueue: any[] = []; // Queue for messages to be sent

    constructor(@Inject(DOCUMENT) private document: Document, private rendererFactory: RendererFactory2) {
      this.renderer = this.rendererFactory.createRenderer(null, null);
      this.loadScript('assets/hslib.js');
    }
     loadScript(url: string): Promise<void> {
      return new Promise((resolve, reject) => {
        const script = this.renderer.createElement('script');
        script.src = url;
        script.onload = () => {
          console.log('Script loaded successfully.');
          resolve();
        };
        script.onerror = () => {
          console.error('Script loading failed.');
          reject(new Error('Script loading failed.'));
        };
        this.renderer.appendChild(this.document.body, script);
      });
    }
  // Connect to HSM WebSocket
  connectHsm(token: string, sid: string, callback: (msg: MessageEvent) => void) {
    const url = 'wss://mlhsm.kotaksecurities.com';
    this.userWS = new HSWebSocket(url);
    this.userWS.onopen = () => {
      //console.log(`[HSM Socket onopen]: Connected to "${url}"`);
      console.log(`[HSM Socket]: Connection opened`);
      const jObj = {
        Authorization: token,
        Sid: sid,
        type: 'cn'
      };
      this.userWS?.send(JSON.stringify(jObj));
       // Send any queued messages
       while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        this.userWS?.send(JSON.stringify(message));
      }
    };


    this.userWS.onclose = () => {
      console.log('[onclose HSM Socket onclose]: Disconnected!');
    };

    this.userWS.onerror = () => {
      console.log('[onerror HSM Socket Error]: Error!');
    };

    this.userWS.onmessage = (msg: MessageEvent) => {
      console.log('[onmessage HSM Socket message]: Received message', msg);
      callback(msg);
    };
  }
  connectHsi(token: string, sid: string, handshakeServerId: string, callback: (msg: MessageEvent) => void) {
    const url = `wss://mlhsi.kotaksecurities.com/realtime?sId=${handshakeServerId}`;
    this.hsWs = new WebSocket(url);

    this.hsWs.onopen = () => {
     // console.log(`[onopen HSI Socket]: Connected to "${url}"`);
      const hsijObj = {
        type: 'cn',
        Authorization: token,
        Sid: sid,
        source: 'WEB'
      };
      this.hsWs?.send(JSON.stringify(hsijObj));
    };

    this.hsWs.onclose = () => {
      console.log('[onclose HSI Socket]: Disconnected!');
    };

    this.hsWs.onerror = () => {
      console.log('[onerror HSI Socket]: Error!');
    };

    this.hsWs.onmessage = (msg: MessageEvent) => {
      console.log('[onmessage HSI Socket]: Received message', msg);
      callback(msg);
    };
  }

  sendMessageToUserWS(message: object) {
    if (this.userWS && this.userWS.readyState === WebSocket.OPEN) {
      this.userWS.send(JSON.stringify(message));
      console.log('WebSocket is connected and message sent:', JSON.stringify(message));
    } else {
      // Queue the message if WebSocket is not open
      console.error('WebSocket is not connected. Queuing message:', message);
      this.messageQueue.push(message);
    }
  }

  sendMessageToHsWs(message: object) {
    if (this.hsWs && this.hsWs.readyState === WebSocket.OPEN) {
      this.hsWs.send(JSON.stringify(message));
      console.log('HS WebSocket is connected and message sent:', message);
    } else {
      console.error('HS WebSocket is not connected.');
    }
  }
  }
