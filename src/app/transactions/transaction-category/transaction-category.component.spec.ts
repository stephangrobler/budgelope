import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionCategoryComponent } from './transaction-category.component';

describe('TransactionCategoryComponent', () => {
  let component: TransactionCategoryComponent;
  let fixture: ComponentFixture<TransactionCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransactionCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
