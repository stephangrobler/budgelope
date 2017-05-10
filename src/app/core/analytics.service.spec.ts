import { TestBed, inject } from '@angular/core/testing';

import { AnalyticsServiceService } from './analytics-service.service';

describe('AnalyticsServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AnalyticsServiceService]
    });
  });

  it('should ...', inject([AnalyticsServiceService], (service: AnalyticsServiceService) => {
    expect(service).toBeTruthy();
  }));
});
