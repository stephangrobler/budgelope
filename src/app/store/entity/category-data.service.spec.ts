import { TestBed } from '@angular/core/testing';

import { CategoryDataService } from './category-data.service';

describe('CategoryDataService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CategoryDataService = TestBed.get(CategoryDataService);
    expect(service).toBeTruthy();
  });
});
