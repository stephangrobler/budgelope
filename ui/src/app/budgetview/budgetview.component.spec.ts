import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { BudgetviewComponent } from './budgetview.component';
import { BudgetService } from '../budgets/budget.service';
import { UserService } from '../shared/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import * as moment from 'moment';

import { ActivatedRouteStub } from '../../testing/activate-route-stub';
import { CategoryService } from '../categories/category.service';

describe('BudgetviewComponent', () => {
  let component: BudgetviewComponent;
  let fixture: ComponentFixture<BudgetviewComponent>;

  let budgetServiceStub;
  let userServiceStub: Partial<UserService>;
  let categoryServiceStub;
  let activatedRouteStub: ActivatedRouteStub;
  let angularFirestoreServiceStub;
  let angularFireAuthServiceStub;

  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(waitForAsync(() => {
    activatedRouteStub = new ActivatedRouteStub();
    activatedRouteStub.setParamMap({
      month: '201805'
    });

    angularFireAuthServiceStub = jasmine.createSpyObj('AngularFireAuth', ['authenticate']);
    angularFireAuthServiceStub.authState = of({
      uid: '12345'
    });

    angularFirestoreServiceStub = jasmine.createSpyObj('AngularFirestore', ['doc', 'collection']);
    angularFirestoreServiceStub.doc.and.returnValue({
      valueChanges: function() {
        return of({});
      }
    });

    budgetServiceStub = jasmine.createSpyObj('BudgetService', ['getActiveBudget$', 'getByKey']);
    budgetServiceStub.getByKey.and.returnValue(
      of({
        id: '67890',
        name: 'test budget',
        allocations: {}
      })
    );
    userServiceStub = {};
    categoryServiceStub = jasmine.createSpyObj('CategoryService', ['getWithQuery']);
    categoryServiceStub.getWithQuery.and.returnValue(of([]));
    categoryServiceStub.entities$ = of([]);

    TestBed.configureTestingModule({
      imports: [MatMenuModule],
      declarations: [BudgetviewComponent],
      schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: AngularFirestore,
          useValue: angularFirestoreServiceStub
        },
        {
          provide: AngularFireAuth,
          useValue: angularFireAuthServiceStub
        },
        {
          provide: BudgetService,
          useValue: budgetServiceStub
        },
        {
          provide: UserService,
          useValue: userServiceStub
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub
        },
        {
          provide: Router,
          useValue: routerSpy
        },
        {
          provide: CategoryService,
          useValue: categoryServiceStub
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    angularFirestoreServiceStub.doc.and.callFake(function(args) {
      if (args === 'users/12345') {
        return {
          valueChanges: function() {
            return of({
              activeBudget: '67890',
              availableBudgets: {
                testBudget: { name: 'TestBudget1' },
                testBudget2: { name: 'TestBudget2' },
                testBudget3: { name: 'TestBudget3' }
              }
            });
          }
        };
      } else if (args === 'budgets/67890') {
        return {
          valueChanges: function() {
            return of({
              allocations: []
            });
          }
        };
      }
    });

    angularFirestoreServiceStub.collection.and.returnValue({
      snapshotChanges: function() {
        return of([]);
      }
    });

    fixture = TestBed.createComponent(BudgetviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create a component', () => {
    expect(component).toBeTruthy();
  });

  it('should load the categories for the active budget', () => {
    expect(categoryServiceStub.getWithQuery).toHaveBeenCalledWith({
      budgetId: '67890',
      orderBy: 'sortingOrder'
    });
  });

  it('should load the active budget details and allocations', () => {
    expect(budgetServiceStub.getByKey).toHaveBeenCalled();
  });

  it('should get the display month from the month param', () => {
    
    const displayMonth = moment('20180501').format('MMMM YYYY');
    expect(component.displayMonth).toEqual(displayMonth);
  });
});
