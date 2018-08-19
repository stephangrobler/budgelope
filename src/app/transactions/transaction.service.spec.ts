import { TestBed, async } from '@angular/core/testing';
import { TransactionService } from './transaction.service';
import { CategoryService } from '../categories/category.service';
import { AngularFirestore } from 'angularfire2/firestore';
import { Account } from '../shared/account';
import { Category } from '../shared/category';
import { Budget } from '../shared/budget';
import { Transaction } from '../shared/transaction';
import { Observable, of } from 'rxjs';
import { AccountService } from '../accounts/account.service';
import { resolve } from 'path';

describe('Transaction Service to be thing', () => {
  let service: TransactionService;
  let dbMock,
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
    categoryServiceMock = jasmine.createSpyObj('CategoryService', [
      'updateCategoryBudget',
      'getCategories'
    ]);
    accountServiceMock = jasmine.createSpyObj('AccountService', ['updateAccount', 'getAccounts']);
    budgetServiceMock = jasmine.createSpyObj('BudgetService', ['updateBudget']);
    TestBed.configureTestingModule({
      providers: [
        TransactionService,
        { provide: CategoryService, useValue: categoryServiceMock },
        { provide: AccountService, useValue: accountServiceMock },
        { provide: AngularFirestore, useValue: dbMock }
      ]
    });

    service = new TransactionService(
      dbMock,
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
    account.name = 'test';
    account.balance = 0;

    const resultAccount = new Account();
    resultAccount.name = 'test';
    resultAccount.balance = 500;

    const resultBudget = new Budget();
    resultBudget.allocations = {
      201801: {
        expense: 0,
        income: 500
      }
    };
    resultBudget.balance = 500;

    const categories = [
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

    service.createTransaction(transaction, account, categories, budget, 'CurrentBudget').then(
      response => {
        console.log(budget);
        expect(budgetServiceMock.updateBudget).toHaveBeenCalledWith(resultBudget);
        expect(accountServiceMock.updateAccount).toHaveBeenCalledWith(
          resultAccount,
          'CurrentBudget'
        );
        done();
      },
      error => {
        expect(error).toBe('Error thrown');
        console.log('ERROR:', error);
        done();
      }
    );

    // expect(transaction.amount).toBe(5);
  });

  it('should create a transaction with the correct expense transaction', (done: DoneFn) => {
    account.name = 'test';
    account.balance = 0;

    const resultAccount = new Account();
    resultAccount.name = 'test';
    resultAccount.balance = -500;

    const resultBudget = new Budget();
    resultBudget.allocations = {
      201801: {
        expense: 500,
        income: 0
      }
    };
    resultBudget.balance = 500;

    const categories = [
      {
        category: category,
        in: 0,
        out: 500
      }
    ];
    transaction.amount = -500;
    transaction.out = 500;
    transaction.date = new Date('2018-01-01');

    budget.allocations = {};
    budget.balance = 500;

    service.createTransaction(transaction, account, categories, budget, 'CurrentBudget').then(
      response => {
        expect(budgetServiceMock.updateBudget).toHaveBeenCalledWith(resultBudget);
        expect(accountServiceMock.updateAccount).toHaveBeenCalledWith(
          resultAccount,
          'CurrentBudget'
        );
        done();
      },
      error => {
        expect(error).toBe('Error thrown');
        console.log('ERROR:', error);
        done();
      }
    );

    // expect(transaction.amount).toBe(5);
  });

  it('should call create transaction 2 times', (done: DoneFn) => {
    categoryServiceMock.getCategories.and.returnValue(
      of([{ name: 'Transfer In', balance: 0 }, { name: 'Transfer Out', balance: 0 }])
    );

    accountServiceMock.getAccounts.and.returnValue(
      of([
        { name: 'Test Account 1', id: 1, balance: 1000 },
        { name: 'Test Account 2', id: 2, balance: 0 }
      ])
    );

    transaction.account = {
      accountId: 1,
      accountName: 'Test Account 1'
    };
    transaction.transferAccount = {
      accountId: 2,
      accountName: 'Test Account 2'
    }
    transaction.transferAmount = 500;
    transaction.date = new Date('2018-01-01');

    budget.allocations = {};
    budget.balance = 500;
    spyOn(service, 'createTransaction');

    service.transferTransaction(transaction, 'CurrentBudget');

    expect(service.createTransaction).toHaveBeenCalledTimes(2);
  });

  it('should create a transaction for the from account', (done: DoneFn) => {
    categoryServiceMock.getCategories.and.returnValue(
      of([{ name: 'Transfer In', balance: 0 }, { name: 'Transfer Out', balance: 0 }])
    );

    accountServiceMock.getAccounts.and.returnValue(
      of([
        { name: 'Test Account 1', id: 1, balance: 1000 },
        { name: 'Test Account 2', id: 2, balance: 0 }
      ])
    );

    transaction.account = {
      accountId: 1,
      accountName: 'Test Account 1'
    };
    transaction.transferAccount = {
      accountId: 2,
      accountName: 'Test Account 2'
    }
    transaction.transferAmount = 500;
    transaction.date = new Date('2018-01-01');

    budget.allocations = {};
    budget.balance = 500;

    const toAccount = new Account();
    toAccount.name = 'Test Account 2';
    toAccount.balance = 500;

    spyOn(service, 'createTransaction');

    service.transferTransaction(transaction, 'CurrentBudget');

    expect(service.createTransaction).toHaveBeenCalledWith(
      transaction,
      toAccount,
      jasmine.any(Object),
      jasmine.any(Object),
      jasmine.any(String),
    );
  });

  it('should create a transaction for the to account', (done: DoneFn) => {
    categoryServiceMock.getCategories.and.returnValue(
      of([{ name: 'Transfer In', balance: 0 }, { name: 'Transfer Out', balance: 0 }])
    );

    accountServiceMock.getAccounts.and.returnValue(
      of([
        { name: 'Test Account 1', id: 1, balance: 1000 },
        { name: 'Test Account 2', id: 2, balance: 0 }
      ])
    );

    transaction.account = {
      accountId: 1,
      accountName: 'Test Account 1'
    };
    transaction.transferAccount = {
      accountId: 2,
      accountName: 'Test Account 2'
    }
    transaction.transferAmount = 500;
    transaction.date = new Date('2018-01-01');

    budget.allocations = {};
    budget.balance = 500;
    spyOn(service, 'createTransaction');

    service.transferTransaction(transaction, 'CurrentBudget');

    expect(service.createTransaction).toHaveBeenCalledTimes(2);
  });
});
