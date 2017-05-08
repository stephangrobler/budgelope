import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetviewComponent } from './budgetview.component';

describe('BudgetviewComponent', () => {
  let component: BudgetviewComponent;
  let fixture: ComponentFixture<BudgetviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BudgetviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BudgetviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
