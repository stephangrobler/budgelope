import { TestBed } from '@angular/core/testing';

import { BudgetDataService } from './budget-data.service';

describe('BudgetDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BudgetDataService = TestBed.get(BudgetDataService);
    expect(service).toBeTruthy();
  });
});
