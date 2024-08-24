import { TestBed } from '@angular/core/testing';

import { KotakWebsocketService } from './kotak-websocket.service';

describe('KotakWebsocketService', () => {
  let service: KotakWebsocketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(KotakWebsocketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
