import { TestBed } from '@angular/core/testing';

import { CsvProcessingServiceService } from './csv-processing-service.service';

describe('CsvProcessingServiceService', () => {
  let service: CsvProcessingServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CsvProcessingServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
