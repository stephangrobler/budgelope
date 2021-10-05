import { TestBed } from '@angular/core/testing';

import { PayeeService } from './payee.service';

describe('PayeeService', () => {
  let service: PayeeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PayeeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
