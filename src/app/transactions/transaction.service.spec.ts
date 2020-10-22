import { TestBed, async } from '@angular/core/testing';
import { TransactionService } from './transaction.service';
import { CategoryService } from '../categories/category.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Account } from '../shared/account';
import { Category } from '../shared/category';
import { Budget } from '../shared/budget';
import { Transaction, TransactionTypes } from '../shared/transaction';
import { Observable, of } from 'rxjs';
import { AccountService } from '../accounts/account.service';
import { resolve } from 'path';
import { FirebaseApp } from '@angular/fire';
import { IImportedTransaction } from './import/importedTransaction';
import { EntityCollectionServiceElementsFactory } from '@ngrx/data';

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
    transaction,
    ecsebMock,
    serviceElementsFactoryMock;

  beforeEach(() => {
    account = new Account();
    category = {} as Category;
    budget = {} as Budget;
    transaction = {} as Transaction;

    dbMock = jasmine.createSpyObj('AngularFirestore', [
      'collection',
      'doc',
      'createId'
    ]);
    dbMock.createId.and.returnValue('RandomString');
    dbMock.doc.and.returnValue({
      valueChanges: () => of({}),
      delete: jasmine.createSpy('delete'),
      ref: { ref: 'noop' }
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
    accountServiceMock.updateAccountBalance.and.returnValue(of({}));
    budgetServiceMock = jasmine.createSpyObj('BudgetService', [
      'updateBudgetBalance'
    ]);
    serviceElementsFactoryMock = jasmine.createSpyObj(
      'EntityCollectionServiceElementsFactory',
      ['create']
    );

    ecsebMock = {
      add: () => of({}),
      getByKey: () => of({ account: { accountId: 'ACC_01' } }),
      delete: () => of({}),
      dispatcher: {
        add: () => of({}),
        getByKey: () => of({ account: { accountId: 'ACC_01' } }),
        delete: () => of({})
      },
      selectors$: {}
    };

    serviceElementsFactoryMock.create.and.returnValue(ecsebMock);

    TestBed.configureTestingModule({
      providers: [
        TransactionService,
        { provide: CategoryService, useValue: categoryServiceMock },
        { provide: AccountService, useValue: accountServiceMock },
        { provide: AngularFirestore, useValue: dbMock },
        { provide: FirebaseApp, useValue: fbMock },
        {
          provide: EntityCollectionServiceElementsFactory,
          useValue: serviceElementsFactoryMock
        }
      ]
    });

    service = new TransactionService(
      serviceElementsFactoryMock,
      dbMock,
      fbMock,
      categoryServiceMock,
      accountServiceMock,
      budgetServiceMock
    );
  });

  it('should create a transaction with the correct income transaction', (done: DoneFn) => {
    transaction.account = {
      id: 'acc1',
      name: 'test'
    };

    transaction.categories = [
      {
        category: {name: 'income'},
        in: 0,
        out: 100
      }
    ];
    transaction.amount = 500;
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
      id: 'acc1',
      name: 'test'
    };

    transaction.categories = [
      {
        category: {name: 'Groceries'},
        in: 0,
        out: 500
      }
    ];
    transaction.amount = -500;
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

  it('should remove a transaction from the store', (done: DoneFn) => {
    // arrange
    spyOn(service, 'getByKey').and.returnValue(
      of({
        account: { id: 'TEST_ACC' },
        categories: { TEST_CAT: { in: 0, out: 500 } },
        amount: -500,
        date: '2018-12-01'
      })
    );
    // action
    service.removeTransaction('12345', 'REMOVE_ME').then(() => {
      // assert
      expect(budgetServiceMock.updateBudgetBalance).toHaveBeenCalledWith(
        '12345',
        '2018-12-01',
        500
      );
      expect(accountServiceMock.updateAccountBalance).toHaveBeenCalledWith(
        'TEST_ACC',
        500
      );
      expect(categoryServiceMock.updateCategoryBudget).toHaveBeenCalledWith(
        'TEST_CAT',
        '201812',
        500,
        0
      );
      done();
    });
  });

  describe('Match transactions', () => {
    beforeEach(() => {
      dbMock.firestore = {
        batch: () => {
          return {
            set: () => {},
            update: () => {},
            commit: () => Promise.resolve('Return after commit')
          };
        }
      };
    });

    it('should match the stored transactions with the imported values', () => {
      // arrange
      const importedTransactions: IImportedTransaction[] = [
        {
          dtposted: '20190304',
          trnamt: '-50.33',
          fitid: 'testid001',
          trntype: 'DEBIT'
        },
        {
          dtposted: '20190304',
          trnamt: '-150.33',
          fitid: 'testid002',
          trntype: 'DEBIT'
        },
        {
          dtposted: '20190305',
          trnamt: '-250.33',
          fitid: 'testid003',
          trntype: 'DEBIT'
        },
        {
          dtposted: '20190305',
          trnamt: '-350.33',
          fitid: 'testid005',
          trntype: 'DEBIT'
        }
      ];

      const day = new Date('2019-03-04');

      const currentTransactions: Transaction[] = [
        {
          id: '001',
          date: day,
          amount: -50.33,
          account: {
            id: 'ACC001',
            name: 'TESTACCOUNT'
          },
          cleared: false,
          type: TransactionTypes.EXPENSE,
          categories: {
            TESTID001: {
              name: 'TEST',
              in: 0,
              out: -50.33
            }
          },
          memo: '',
          payee: ''
        } as Transaction
      ];

      // action

      // assert

      const matching = service.doMatching(
        currentTransactions,
        importedTransactions
      );
      expect(matching.matched.length).toBe(1);
      expect(matching.unmatched.length).toBe(3);
    });

    it('should create a batched update of the matched transactions', () => {
      // arrange
      const transactions = [
        <Transaction>{ id: 'TEST001' },
        <Transaction>{ id: 'TEST002' },
        <Transaction>{ id: 'TEST003' }
      ];

      // action
      service.batchUpdateMatched(transactions, 'TESTBUDGET');

      // assert
    });

    it('should create a batched transcations of unmatched transactions', async (done: DoneFn) => {
      // arrange
      const importedTransactions: IImportedTransaction[] = [
        {
          dtposted: '20190304',
          trnamt: '50.33',
          fitid: 'testid001',
          trntype: 'CREDIT'
        },
        {
          dtposted: '20190304',
          trnamt: '-150.33',
          fitid: 'testid002',
          trntype: 'DEBIT'
        },
        {
          dtposted: '20190305',
          trnamt: '-250.33',
          fitid: 'testid003',
          trntype: 'DEBIT'
        },
        {
          dtposted: '20190305',
          trnamt: '-350.33',
          fitid: 'testid005',
          trntype: 'DEBIT'
        }
      ];
      const transDate = new Date('2019-03-05');
      // action
      service
        .batchCreateTransactions(
          importedTransactions,
          'TESTBUDGET',
          'ACC001',
          'ACCOUNTNAME'
        )
        .then(() => {
          // assert
          expect(accountServiceMock.updateAccountBalance).toHaveBeenCalledWith(
            'ACC001',
            -700.6600000000001
          );
          expect(categoryServiceMock.updateCategoryBudget).toHaveBeenCalledWith(
            'UNCATEGORIZED',
            '201903',
            0,
            -700.6600000000001
          );

          expect(budgetServiceMock.updateBudgetBalance).toHaveBeenCalledWith(
            'TESTBUDGET',
            jasmine.anything(),
            -700.6600000000001
          );
          done();
        });
    });

    it('should update the account balance with the correct amount', async (done: DoneFn) => {
      // arrange
      const importedTransactions: IImportedTransaction[] = [
        {
          dtposted: '20190304',
          trnamt: '50.33',
          fitid: 'testid001',
          trntype: 'CREDIT'
        },
        {
          dtposted: '20190304',
          trnamt: '-150.33',
          fitid: 'testid002',
          trntype: 'DEBIT'
        },
        {
          dtposted: '20190305',
          trnamt: '-250.33',
          fitid: 'testid003',
          trntype: 'DEBIT'
        },
        {
          dtposted: '20190305',
          trnamt: '-350.33',
          fitid: 'testid005',
          trntype: 'DEBIT'
        }
      ];
      // action
      service
        .batchCreateTransactions(
          importedTransactions,
          'TESTBUDGET',
          'ACC001',
          'ACCOUNTNAME'
        )
        .then(() => {
          // assert
          expect(accountServiceMock.updateAccountBalance).toHaveBeenCalledWith(
            'ACC001',
            -700.6600000000001
          );
          done();
        });
    });
  });

  describe('Update transactions', () => {
    let newTransaction, currentTransaction;
    beforeEach(() => {
      const date = new Date('2018-01-01');
      newTransaction = {
        id: 'TESTTRANSACTION',
        account: {
          id: 'ACC001',
          name: 'TestAccount'
        },
        amount: -500,
        categories: {
          TEST_CAT: { in: 0, out: 500, name: 'TEST_CAT' }
        },
        cleared: false,
        payee: 'Test',
        type: TransactionTypes.EXPENSE,
        date
      } as Transaction;
      currentTransaction = {
        id: 'TESTTRANSACTION',
        account: {
          id: 'ACC001',
          name: 'TestAccount'
        },
        amount: -500,
        categories: {
          TEST001: { in: 0, out: 500, name: 'TEST001' }
        },
        cleared: false,
        payee: 'Someone',
        type: TransactionTypes.EXPENSE,
        date
      } as Transaction;

      ecsebMock = {
        add: () => of({}),
        getByKey: () => of({ account: { accountId: 'ACC_01' } }),
        delete: () => of({}),
        dispatcher: {
          add: () => of({}),
          getByKey: () => of({ account: { accountId: 'ACC_01' } }),
          delete: () => of({})
        },
        selectors$: {}
      };
    });

    it('should update the account balance if account changed and is income type', (done: DoneFn) => {
      // arrange
      currentTransaction = {
        id: 'TESTTRANSACTION',
        account: {
          id: 'ACC001',
          name: 'TestAccount'
        },
        amount: 500,
        categories: [
          { in: 500, out: 0, category: { id: 'TEST001', name: 'TEST001' } }
        ],
        date: '2018-01-01'
      };

      newTransaction.account = {
        accountId: 'ACC002',
        accountName: 'TestAccount002'
      };
      newTransaction.amount = 500;
      spyOn(service, 'getByKey').and.returnValue(of(currentTransaction));
      spyOn(service, 'update').and.returnValue(of(currentTransaction));
      // action
      service.updateTransaction('BUDGETSTRING', newTransaction).then(() => {
        expect(accountServiceMock.updateAccountBalance).toHaveBeenCalledTimes(
          2
        );
        // assert
        done();
      });
    });

    it('should update the account balance if account changed and is expense type', (done: DoneFn) => {
      // arrange
      newTransaction.account = {
        id: 'ACC002',
        name: 'TestAccount002'
      };
      newTransaction.amount = -500;
      spyOn(service, 'getByKey').and.returnValue(of(currentTransaction));
      spyOn(service, 'update').and.returnValue(of(currentTransaction));

      // action
      service.updateTransaction('BUDGETSTRING', newTransaction).then(() => {
        expect(accountServiceMock.updateAccountBalance).toHaveBeenCalledTimes(
          2
        );
        // assert
        done();
      });
    });

    it('should update the account balance if amount changed', (done: DoneFn) => {
      // arrange
      newTransaction.account = {
        id: 'ACC001',
        name: 'TestAccount'
      };
      newTransaction.amount = 500;
      spyOn(service, 'getByKey').and.returnValue(of(currentTransaction));
      spyOn(service, 'update').and.returnValue(of(currentTransaction));

      // action
      service.updateTransaction('BUDGETSTRING', newTransaction).then(() => {
        expect(accountServiceMock.updateAccountBalance).toHaveBeenCalledTimes(
          1
        );
        // assert
        done();
      });
    });

    it('should update the categories if the amount has changed', (done: DoneFn) => {
      // arrange
      newTransaction.categories = {
        TEST001: { name: 'TestCat', in: 0, out: 400 }
      };
      newTransaction.amount = 400;
      spyOn(service, 'getByKey').and.returnValue(of(currentTransaction));
      spyOn(service, 'update').and.returnValue(of(currentTransaction));

      // action
      service.updateTransaction('BUDGETSTRING', newTransaction).then(() => {
        expect(categoryServiceMock.updateCategoryBudget).toHaveBeenCalledTimes(
          2
        );
        // assert
        done();
      });
    });

    it('should update a transaction if category changed', (done: DoneFn) => {
      // arrange
      newTransaction.categories = {
        TEST: { name: 'TestCat', in: 0, out: 500 }
      };
      spyOn(service, 'getByKey').and.returnValue(of(currentTransaction));
      spyOn(service, 'update').and.returnValue(of(currentTransaction));

      // action
      service.updateTransaction('BUDGETSTRING', newTransaction).then(() => {
        expect(categoryServiceMock.updateCategoryBudget).toHaveBeenCalledTimes(
          2
        );
        // reverse check
        expect(categoryServiceMock.updateCategoryBudget).toHaveBeenCalledWith(
          'TEST001',
          '201801',
          500,
          0
        );
        // new check
        expect(categoryServiceMock.updateCategoryBudget).toHaveBeenCalledWith(
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
        TEST001: { name: 'TEST001', in: 0, out: 500 }
      };
      spyOn(service, 'getByKey').and.returnValue(of(currentTransaction));
      spyOn(service, 'update').and.returnValue(of(currentTransaction));

      // action
      service.updateTransaction('BUDGETSTRING', newTransaction).then(() => {
        expect(categoryServiceMock.updateCategoryBudget).toHaveBeenCalledTimes(
          0
        );
        done();
      });
    });

    it('should return void if 1 option in array is a boolean', () => {
      // arrange
      const importedTransactions: IImportedTransaction[] = [
        {
          dtposted: '20190304',
          trnamt: '-50.33',
          fitid: 'testid001',
          trntype: 'DEBIT'
        },
        {
          dtposted: '20190304',
          trnamt: '-150.33',
          fitid: 'testid002',
          trntype: 'DEBIT'
        },
        {
          dtposted: '20190305',
          trnamt: '-250.33',
          fitid: 'testid003',
          trntype: 'DEBIT'
        },
        {
          dtposted: '20190305',
          trnamt: '-350.33',
          fitid: 'testid005',
          trntype: 'DEBIT'
        }
      ];

      const currentTransactions = [];

      // action

      // assert

      service.doMatching(currentTransactions, importedTransactions);
    });
  });
});
