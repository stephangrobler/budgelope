import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { BudgetService } from './budget.service';
import { CategoryService } from '../categories/category.service';
import { AccountService } from '../accounts/account.service';

describe('Budget service', () => {
  let budgetService: BudgetService;
  let categoryServiceSpy, accountServiceSpy, dbSpy, authSpy;

  beforeEach(() => {
    categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['getValue']);
    accountServiceSpy = jasmine.createSpyObj('AccountService', ['getValue']);
    dbSpy = jasmine.createSpyObj('AngularFirestore', ['doc', 'collection']);
    authSpy = jasmine.createSpyObj('AngularFireAuth', ['login']);
    authSpy.authState = of({
        uid: 'abcde'
    })

    TestBed.configureTestingModule({
      // Provide both the service-to-test and its (spy) dependency
      providers: [
        BudgetService,
        {
          provide: CategoryService,
          useValue: categoryServiceSpy
        },
        {
          provide: AccountService,
          useValue: accountServiceSpy
        },
        {
          provide: AngularFirestore,
          useValue: dbSpy
        },
        {
          provide: AngularFireAuth,
          useValue: authSpy
        }
      ]
    });
    // Inject both the service-to-test and its (spy) dependency
    budgetService = TestBed.get(BudgetService);
  });

  it('should have a getActiveBudget$ method', () => {
      expect(budgetService.getActiveBudget$()).toBeDefined('should have a method getActiveBudget$');
  })
});
