import { Injectable, Inject, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private renderer: Renderer2;
  private socket: WebSocket  | null = null;;
  private url: string = 'wss://mlhsm.kotaksecurities.com'; // Replace with your WebSocket URL
  public liveData: { [key: string]: any } = {};
  public messages: Subject<any> = new Subject<any>();
  private messageQueue: any[] = []; // Queue for messages to be sent
  private userWSMessageSubject = new Subject<MessageEvent>();

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

   initializeWebSocket(token: string, sid: string, callback: (msg: MessageEvent) => void) {
    this.socket = new WebSocket(this.url);
    //console.log("token",token,"sid",sid);
    this.socket.onopen = () => {
      //console.log(`[HSM Socket onopen]: Connected to "${url}"`);
      console.log(`[initialize WebSocket]: Connection opened`);
      const jObj = {
        Authorization: token,
        Sid: sid,
        type: 'cn'
      };

      this.socket?.send(JSON.stringify(jObj));
       // Send any queued messages
       while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        this.socket?.send(JSON.stringify(message));
      }
    };

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        data.forEach((item: any) => {
          this.liveData[item.tk] = item.ltp;
        });
        this.messages.next(this.liveData);
        console.log('Updated live data:', this.liveData);
        this.userWSMessageSubject.next(event); 
        callback(event);
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    this.socket.onclose = () => {
      console.log('[OnClose]: Connection closed');
    };

    this.socket.onerror = (error: Event) => {
      console.error('[On Error]:', error);
    };
  }

  public subscribeToTokens(tokens: { instrument_token: string, exchange_segment: string }[]) {
    console.log("instrument_token",tokens,"exchange_segment",tokens)
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        action: 'subscribe',
        instrument_tokens: tokens,
        isIndex: false,
        isDepth: false
      }));
    } else {
      console.error('WebSocket is not open. Unable to subscribe.');
    }
  }

  public unsubscribeFromTokens(tokens: { instrument_token: string, exchange_segment: string }[]) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        action: 'unsubscribe',
        instrument_tokens: tokens
      }));
    } else {
      console.error('WebSocket is not open. Unable to unsubscribe.');
    }
  }

  public close() {
    if (this.socket) {
      this.socket.close();
      console.log('WebSocket connection closed');
    }
  }
}
