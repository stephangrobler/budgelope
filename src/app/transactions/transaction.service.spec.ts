import { TestBed, async } from '@angular/core/testing';
import { TransactionService } from './transaction.service';
import { CategoryService } from '../categories/category.service';
import { AngularFirestore } from 'angularfire2/firestore';
import { Account } from '../shared/account';
import { Category } from '../shared/category';
import { Budget } from '../shared/budget';
import { Transaction } from '../shared/transaction';
import { Observable, of } from 'rxjs';

describe('Transaction Service to be thing', () => {
  let service: TransactionService;
  let dbMock, categoryServiceMock;

  const account = new Account();
  const category = new Category();
  const budget = new Budget();
  const transaction = new Transaction();

  beforeEach(() => {
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
      }
    });
    categoryServiceMock = jasmine.createSpyObj('CategoryService', ['test']);

    TestBed.configureTestingModule({
      providers: [
        TransactionService,
        { provide: CategoryService, useValue: categoryServiceMock },
        { provide: AngularFirestore, useValue: dbMock }
      ]
    });

    service = new TransactionService(dbMock, categoryServiceMock);
  });

  it('should register as a service', () => {
    const subscription = service.getTransaction('string', 'string2');
    expect(dbMock.doc).toHaveBeenCalledWith('budgets/string/transactions/string2');
  });

  it('should add a transaction to the correct place', () => {
    account.name = 'test';
    account.balance = 0;
    transaction.amount = 0;
    transaction.in = 5;
    transaction.date = new Date('2018-01-01');

    // service.updateTransaction('transactionId', transaction, account, category, budget);

    // expect(transaction.amount).toBe(5);
  });
});
