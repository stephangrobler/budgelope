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

describe('Transaction Service', () => {
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
      valueChanges: () => of({}),
      delete: jasmine.createSpy('delete')
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
      runTransaction: callback => {
        callback({
          get: () => {
            return Promise.resolve({
              data: () => {
                return { test: 'test' };
              }
            });
          }
        });
        return Promise.resolve({});
      }
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

  it('should remove a transaction from the store', (done: DoneFn) => {
    // arrange
    dbMock.doc.and.returnValue({
      valueChanges: () =>
        of({
          account: {
            accountId: 'ACC_001'
          },
          amount: -500,
          categories: {
            TEST_CAT1: { in: 0, out: 500 }
          },
          date: '2018-12-01'
        }),
      delete: () => {
        return {
          then: success => {
            success();
          }
        };
      }
    });
    // action
    service.removeTransaction('12345', 'REMOVE_ME').then(() => {
      // assert
      expect(budgetServiceMock.updateBudgetBalance).toHaveBeenCalledWith(
        '12345',
        '2018-12-01',
        500
      );
      expect(accountServiceMock.updateAccountBalance).toHaveBeenCalledWith('ACC_001', '12345', 500);
      expect(categoryServiceMock.updateCategoryBudget).toHaveBeenCalledWith(
        '12345',
        'TEST_CAT1',
        '201812',
        500,
        0
      );
      done();
    });
  });

  describe('Update transactions', () => {
    let newTransaction, currentTransaction;
    beforeEach(() => {
      newTransaction = new Transaction({
        id: 'TESTTRANSACTION',
        account: {
          id: 'ACC001',
          name: 'TestAccount'
        },
        amount: -500,
        categories: [{ in: 0, out: 500, category: { id: 'TEST001', name: 'TEST001' } }],
        date: '2018-01-01'
      });
      currentTransaction = new Transaction({
        id: 'TESTTRANSACTION',
        account: {
          id: 'ACC001',
          name: 'TestAccount'
        },
        amount: -500,
        categories: [{ in: 0, out: 500, category: { id: 'TEST001', name: 'TEST001' } }],
        date: '2018-01-01'
      });
      fbMock.firestore.and.returnValue({
        runTransaction: callback => {
          callback({
            get: () => {
              return Promise.resolve({
                data: () => {
                  return currentTransaction;
                }
              });
            },
            update: () => {
              return Promise.resolve({});
            }
          });
          return Promise.resolve({});
        }
      });
      dbMock.doc.and.returnValue({
        valueChanges: () =>
          of({
            account: {
              accountId: 'ACC_001'
            },
            amount: -500,
            categories: {
              TEST_CAT1: { in: 0, out: 500 }
            },
            date: '2018-12-01'
          }),
        update: () => {},
        delete: () => {
          return {
            then: success => {
              success();
            }
          };
        }
      });
    });
    
    it('should update the account balance if account changed and is income type', (done: DoneFn) => {
      // arrange
      currentTransaction = new Transaction({
        id: 'TESTTRANSACTION',
        account: {
          id: 'ACC001',
          name: 'TestAccount'
        },
        amount: 500,
        categories: [{ in: 500, out: 0, category: { id: 'TEST001', name: 'TEST001' } }],
        date: '2018-01-01'
      });
      fbMock.firestore.and.returnValue({
        runTransaction: callback => {
          callback({
            get: () => {
              return Promise.resolve({
                data: () => {
                  return currentTransaction;
                }
              });
            },
            update: () => {
              return Promise.resolve({});
            }
          });
          return Promise.resolve({});
        }
      });

      newTransaction.account = {
        accountId: 'ACC002',
        accountName: 'TestAccount002'
      }
      newTransaction.amount = 500;

      // action
      service.updateTransaction('BUDGETSTRING', newTransaction).then(() => {
        expect(accountServiceMock.updateAccountBalance).toHaveBeenCalledTimes(2);
        // assert
        done();
      });
    });

    it('should update the account balance if account changed and is expense type', (done: DoneFn) => {
      // arrange
      newTransaction.account = {
        accountId: 'ACC002',
        accountName: 'TestAccount002'
      }
      newTransaction.amount = -500;

      // action
      service.updateTransaction('BUDGETSTRING', newTransaction).then(() => {
        expect(accountServiceMock.updateAccountBalance).toHaveBeenCalledTimes(2);
        // assert
        done();
      });
    });

    it('should update the account balance if amount changed', (done: DoneFn) => {
      // arrange
      newTransaction.account = {
        accountId: 'ACC001',
        accountName: 'TestAccount'
      }
      newTransaction.amount = 500;

      // action
      service.updateTransaction('BUDGETSTRING', newTransaction).then(() => {
        expect(accountServiceMock.updateAccountBalance).toHaveBeenCalledTimes(1);
        // assert
        done();
      });
    });

    it('should update the categories if the amount has changed', (done: DoneFn) => {
      // arrange
      newTransaction.categories = {
        TEST001: { categoryName: 'TestCat', in: 0, out: 400 }
      };
      newTransaction.amount = 400;

      // action
      service.updateTransaction('BUDGETSTRING', newTransaction).then(() => {
        expect(categoryServiceMock.updateCategoryBudget).toHaveBeenCalledTimes(2);
        // assert
        done();
      });

    });

    it('should update a transaction if category changed', (done: DoneFn) => {
      // arrange
      newTransaction.categories = {
        TEST: { categoryName: 'TestCat', in: 0, out: 500 }
      };

      // action
      service.updateTransaction('BUDGETSTRING', newTransaction).then(() => {
        expect(categoryServiceMock.updateCategoryBudget).toHaveBeenCalledTimes(2);
        // reverse check
        expect(categoryServiceMock.updateCategoryBudget).toHaveBeenCalledWith(
          'BUDGETSTRING',
          'TEST001',
          '201801',
          500,
          0
        );
        // new check
        expect(categoryServiceMock.updateCategoryBudget).toHaveBeenCalledWith(
          'BUDGETSTRING',
          'TEST',
          '201801',
          0,
          500
        );
        done();
      });
    });

    it('should not update categories if category ids have not changed', (done: DoneFn) => {
      // arrange
      newTransaction.categories = {
        TEST001: { categoryName: 'TEST001', in: 0, out: 500 }
      };

      // action
      service.updateTransaction('BUDGETSTRING', newTransaction).then(() => {
        expect(categoryServiceMock.updateCategoryBudget).toHaveBeenCalledTimes(0);
        done();
      });
    });
  });
});
