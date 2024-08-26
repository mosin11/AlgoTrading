import { TestBed } from '@angular/core/testing';

import { ScripMasterService } from './scrip-master.service';

describe('ScripMasterService', () => {
  let service: ScripMasterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScripMasterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
