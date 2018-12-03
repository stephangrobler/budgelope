import { TestBed, async } from '@angular/core/testing';
import { TransactionService } from './transaction.service';
import { CategoryService } from '../categories/category.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Account } from '../shared/account';
import { Category } from '../shared/category';
import { Budget } from '../shared/budget';
import { Transaction } from '../shared/transaction';
import { Observable, of } from 'rxjs';
import { AccountService } from '../accounts/account.service';
import { resolve } from 'path';
import { FirebaseApp } from '@angular/fire';

describe('Transaction Service to be thing', () => {
  let service: TransactionService;
  let dbMock,
    fbMock,
    categoryServiceMock,
    accountServiceMock,
    budgetServiceMock,
    account,
    category,
    budget,
    transaction;

  beforeEach(() => {
    account = new Account();
    category = new Category();
    budget = new Budget();
    transaction = new Transaction();

    dbMock = jasmine.createSpyObj('AngularFirestore', ['collection', 'doc']);
    dbMock.doc.and.returnValue({
      valueChanges: () => {}
    });
    dbMock.collection.and.returnValue({
      doc: function() {
        return {
          valueChanges: () => {
            return of({});
          },
          update: () => {
            return {
              then: () => {}
            };
          }
        };
      },
      add: () => {
        return {
          then: (success, failure) => {
            success();
          }
        };
      }
    });

    fbMock = jasmine.createSpyObj('FirebaseApp', ['firestore']);
    fbMock.firestore.and.returnValue({
      runTransaction: () => {}
    });
    categoryServiceMock = jasmine.createSpyObj('CategoryService', [
      'updateCategoryBudget',
      'getCategories'
    ]);
    accountServiceMock = jasmine.createSpyObj('AccountService', [
      'updateAccountBalance',
      'getAccounts'
    ]);
    budgetServiceMock = jasmine.createSpyObj('BudgetService', ['updateBudgetBalance']);
    TestBed.configureTestingModule({
      providers: [
        TransactionService,
        { provide: CategoryService, useValue: categoryServiceMock },
        { provide: AccountService, useValue: accountServiceMock },
        { provide: AngularFirestore, useValue: dbMock },
        { provide: FirebaseApp, useValue: fbMock }
      ]
    });

    service = new TransactionService(
      dbMock,
      fbMock,
      categoryServiceMock,
      accountServiceMock,
      budgetServiceMock
    );
  });

  it('should register as a service', () => {
    const subscription = service.getTransaction('string', 'string2');
    expect(dbMock.doc).toHaveBeenCalledWith('budgets/string/transactions/string2');
  });

  it('should create a transaction with the correct income transaction', (done: DoneFn) => {
    transaction.account = {
      accountId: 'acc1',
      accountName: 'test'
    };

    transaction.categories = [
      {
        category: category,
        in: 0,
        out: 100
      }
    ];
    transaction.amount = 500;
    transaction.in = 500;
    transaction.date = new Date('2018-01-01');

    budget.allocations = {};
    budget.balance = 0;

    service.createTransaction(transaction, 'CurrentBudget').then(
      response => {
        expect(budgetServiceMock.updateBudgetBalance).toHaveBeenCalledWith(
          'CurrentBudget',
          transaction.date,
          500
        );
        expect(accountServiceMock.updateAccountBalance).toHaveBeenCalledWith(
          'acc1',
          'CurrentBudget',
          500
        );
        done();
      },
      error => {
        expect(error).toBe('Error thrown');
        done();
      }
    );

    // expect(transaction.amount).toBe(5);
  });

  it('should create a transaction with the correct expense transaction', (done: DoneFn) => {
    transaction.account = {
      accountId: 'acc1',
      accountName: 'test'
    };

    transaction.categories = [
      {
        category: category,
        in: 0,
        out: 500
      }
    ];
    transaction.amount = -500;
    transaction.out = 500;
    transaction.date = new Date('2018-01-01');

    service.createTransaction(transaction, 'CurrentBudget').then(
      response => {
        expect(budgetServiceMock.updateBudgetBalance).toHaveBeenCalledWith(
          'CurrentBudget',
          transaction.date,
          -500
        );
        expect(accountServiceMock.updateAccountBalance).toHaveBeenCalledWith(
          'acc1',
          'CurrentBudget',
          -500
        );
        done();
      },
      error => {
        expect(error).toBe('Error thrown');
        done();
      }
    );
  });

  it('should call the the firestore method on the firebase service', () => {

    service.updateTransaction('12345', transaction);
    expect(fbMock.firestore).toHaveBeenCalled();
  });

  it('should call get on the transaction', () => {

    service.updateTransaction('12345', transaction);
    expect(fbMock.firestore).toHaveBeenCalled();
  });

});
