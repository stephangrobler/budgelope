import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { TestBed, async } from '@angular/core/testing';
import { of } from 'rxjs';
import * as moment from 'moment';

import { BudgetService } from './budget.service';
import { CategoryService } from '../categories/category.service';
import { AccountService } from '../accounts/account.service';
import { FirebaseApp } from '@angular/fire';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';

describe('Budget service', () => {
  let budgetService: BudgetService;
  let categoryServiceSpy,
    accountServiceSpy,
    dbSpy,
    docObject,
    authSpy,
    firebaseAppSpy,
    ecsefMock,
    ecsebMock;

  beforeEach(() => {
    categoryServiceSpy = jasmine.createSpyObj('CategoryService', ['copyCategories']);
    accountServiceSpy = jasmine.createSpyObj('AccountService', ['copyAccounts']);
    firebaseAppSpy = jasmine.createSpyObj('FirebaseApp', ['runTransaction']);

    dbSpy = jasmine.createSpyObj('AngularFirestore', ['doc', 'collection']);
    dbSpy.doc.and.callFake(params => {
      if (params === 'users/abcde') {
        return {
          valueChanges: () => of({ activeBudget: '12345' })
        };
      }
      if (params === 'budgets/12345') {
        return {
          valueChanges: () => of({ name: 'budget' })
        };
      }
    });

    docObject = {
      doc: docParams => {
        if (docParams === 'CurrentUserID') {
          return {
            valueChanges: () => of({ id: 'CurrentBudgetID', activeBudgets: {} }),
            update: () => {}
          };
        }
        return {
          valueChanges: () => of({ id: 'CurrentBudgetID' }),
          update: () => {}
        };
      },
      add: addParam => {
        return {
          then: (success, failure) => {
            success({ id: 'DocRef', name: 'NewBudget' });
          }
        };
      },
      valueChanges: () => of({})
    };
    authSpy = jasmine.createSpyObj('AngularFireAuth', ['login']);
    authSpy.authState = of({
      uid: 'abcde'
    });

    ecsefMock = jasmine.createSpyObj('EntityCollectionServiceElementsFactory', ['create']);

    ecsebMock = {
      getByKey: () => {},
      dispatcher: {},
      selectors$: {}
    };

    ecsefMock.create.and.returnValue(ecsebMock);

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
        },
        {
          provide: FirebaseApp,
          useValue: firebaseAppSpy
        },
        {
          provide: EntityCollectionServiceElementsFactory,
          useValue: ecsefMock
        }
      ]
    });
    // Inject both the service-to-test and its (spy) dependency
    budgetService = TestBed.inject(BudgetService);
  });

  it('should have a getActiveBudget$ method', async () => {
    expect(budgetService.getActiveBudget()).toBeDefined('should have a method getActiveBudget$');
  });

  it('should have called the active budget', (done: DoneFn) => {
    budgetService.getActiveBudget().subscribe(testing => {
      expect(dbSpy.doc).toHaveBeenCalledTimes(2);
      expect(testing.name).toEqual('budget', 'should have name "budget"');
      done();
    });
  });

  it('should create a fresh start budget', () => {
    spyOn(docObject, 'add').and.callThrough();

    dbSpy.collection.and.callFake(params => {
      return docObject;
    });
    const month = moment().format('YYYYMM'),
      allocation = { income: 0, expense: 0 },
      newBudget = {
        allocations: {},
        balance: 0
      };
    newBudget.allocations[month] = allocation;

    budgetService.freshStart('CurrentBudgetID', 'CurrentUserID');

    expect(docObject.add).toHaveBeenCalledWith(newBudget);
  });

  it('should copy the accounts to the fresh start budget', () => {
    dbSpy.collection.and.callFake(params => {
      return docObject;
    });

    budgetService.freshStart('CurrentBudgetID', 'CurrentUserID');

    expect(accountServiceSpy.copyAccounts).toHaveBeenCalled();
  });

  it('should not copy the accounts to the fresh start budget if current budget id is default', () => {
    dbSpy.collection.and.callFake(params => {
      return docObject;
    });

    budgetService.freshStart('default', 'CurrentUserID');

    expect(accountServiceSpy.copyAccounts).not.toHaveBeenCalled();
  });

  it('should copy the categories to the fresh start budget', () => {
    dbSpy.collection.and.callFake(params => {
      return docObject;
    });

    budgetService.freshStart('CurrentBudgetID', 'CurrentUserID');

    expect(categoryServiceSpy.copyCategories).toHaveBeenCalledWith('CurrentBudgetID', 'DocRef');
  });

  it('should read the correct user', () => {
    spyOn(docObject, 'doc').and.callFake(params => {
      return {
        valueChanges: () => of({ id: 'CurrentUserID', availableBudgets: {} }),
        update: () => {}
      };
    });

    dbSpy.collection.and.callFake(params => {
      return docObject;
    });

    budgetService.freshStart('CurrentBudgetID', 'TestCurrentUserID');

    expect(docObject.doc).toHaveBeenCalledWith('TestCurrentUserID');
  });

  it('should update the user available budgets and active budget with the fresh start', () => {
    const updateSpy = jasmine.createSpy('update', () => {});
    const newUserObj = {
      id: 'CurrentUserID',
      activeBudget: 'DocRef',
      availableBudgets: {
        testbudgetid: {
          name: 'testbudget1'
        },
        DocRef: {
          name: jasmine.any(String)
        }
      }
    };
    spyOn(docObject, 'doc').and.callFake(params => {
      return {
        valueChanges: () =>
          of({
            id: 'CurrentUserID',
            availableBudgets: {
              testbudgetid: {
                name: 'testbudget1'
              }
            }
          }),
        update: updateSpy
      };
    });

    dbSpy.collection.and.callFake(params => {
      return docObject;
    });

    budgetService.freshStart('CurrentBudgetID', 'CurrentUserID');

    expect(updateSpy).toHaveBeenCalledWith(newUserObj);
  });
});
