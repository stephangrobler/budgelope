import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, take } from 'rxjs/operators';
import * as moment from 'moment';

import { Transaction, TransactionTypes } from '../shared/transaction';
import { CategoryService } from '../categories/category.service';
import { AccountService } from '../accounts/account.service';
import { BudgetService } from '../budgets/budget.service';
import { FirebaseApp } from '@angular/fire';



@Injectable()
export class TransactionService {
  transactions: Transaction[];

  constructor(
    private db: AngularFirestore,
    private fb: FirebaseApp,
    private categoryService: CategoryService,
    private accountService: AccountService,
    private budgetService: BudgetService
  ) {

  }

  /**
   * Get all transactions with the id of the transactions
   * @param  budgetId Current active budget for the user id
   * @return          the observable for the transactions.
   */
  getTransactions(
    budgetId: string,
    accountId?: string,
    cleared?: boolean
  ): Observable<Transaction[]> {
    const transRef = '/budgets/' + budgetId + '/transactions';
    // should not display cleared transactions by default
    const collection = this.db.collection<Transaction>(transRef, ref => {
      let query: firebase.firestore.Query = ref;
      if (!cleared) {
        query = query.where('cleared', '==', false);
      }
      if (accountId) {
        query = query.where('account.accountId', '==', accountId);
      }
      query = query.orderBy('date', 'desc');
      return query;
    });

    return collection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Transaction;
          const id = a.payload.doc.id;
          // convert timestamp object from firebase to date object if object
          const dateObj = a.payload.doc.get('date');
          if (typeof dateObj === 'string') {
            data.date = new Date(dateObj);
          } else if (typeof dateObj === 'object') {
            data.date = dateObj.toDate();
          }

          data.account = {
            accountId: data['accountId'],
            accountName: data['accountName']
          };
          if (data['accountName']) {
            data.accountDisplayName = data['accountName'];
          }

          data.id = id;
          return { id, ...data };
        })
      )
    );
  }


  transactionsByCategory(budgetId: string): void {
    const transRef = 'budgets/' + budgetId + '/transactions';
    this.db
      // .collection<any>(transRef, ref => ref.where('categories.7LMKnFJv5Jdf6NEzAuL2', '>', ''))
      .collection<any>(transRef)
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data() as any;
            const id = a.payload.doc.id;
            console.log('Reading...', a.payload.doc.id, a.payload.doc.data());
            if (a.payload.doc.get('id') === null) {
              data.id = id;
            }
            return { id, ...data };
          })
        ),
        take(1)
      )
      .subscribe(transactions => {
        console.log(JSON.stringify(transactions));
      });
  }

  transformCategoriesToMap(budgetId: string): void {
    const transRef = 'budgets/' + budgetId + '/transactions';
    this.db
      .collection<any>(transRef)
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data() as any;
            const id = a.payload.doc.id;
            console.log('Reading...', a.payload.doc.id, a.payload.doc.data());
            if (a.payload.doc.get('id') === null) {
              data.id = id;
            }
            return { id, ...data };
          })
        ),
        take(1)
      )
      .subscribe(transactions => {
        console.log(transactions);
        transactions.forEach(transaction => {
          const ref = '/budgets/' + budgetId + '/transactions/' + transaction.id;
          const categoryMap = {};
          const categories: any[] = transaction.categories;

          if (typeof categories.length !== 'undefined') {
            categories.forEach(cat => {
              categoryMap[cat.categoryId] = {
                categoryName: cat.categoryName,
                in: cat.in,
                out: cat.out
              };
            });
            console.log('fixing...', transaction.id);
            transaction.categories = categoryMap;
          }
          console.log(ref, transaction);
          this.db
            .doc(ref)
            .update(transaction)
            .then(data => console.log('SAVED:', data));
        });
      });
  }

  getTransaction(budgetId: string, transactionId: string): Observable<Transaction> {
    const transRef = 'budgets/' + budgetId + '/transactions/' + transactionId;
    return this.db.doc<Transaction>(transRef).valueChanges();
  }

  updateClearedStatus(budgetId: string, transaction: Transaction) {
    this.db
      .doc('budgets/' + budgetId + '/transactions/' + transaction.id)
      .update({ cleared: transaction.cleared });
  }

  updateTransaction(budgetId: string, newTransaction: Transaction) {
    const docRef = this.db.doc('budgets/' + budgetId + '/transactions/' + newTransaction.id).ref;
    this.fb.firestore().runTransaction(dbTransaction => {
      return dbTransaction.get(docRef).then(
        readTransaction => {
          const currentTransaction = readTransaction.data();
          // check if the account has changed
          if (
            currentTransaction.account &&
            currentTransaction.account.accountId !== newTransaction.account.accountId
          ) {
            // if it was a expense/negative number
            if (currentTransaction.amount < 0) {
              // add the amount to the previous account
              this.accountService.updateAccountBalance(
                currentTransaction.account.accountId,
                budgetId,
                Math.abs(currentTransaction.amount)
              );
              // subtract from current account
              this.accountService.updateAccountBalance(
                newTransaction.account.accountId,
                budgetId,
                -Math.abs(newTransaction.amount)
              );
            } else {
              // add the amount to the previous account
              this.accountService.updateAccountBalance(
                currentTransaction.account.accountId,
                budgetId,
                -Math.abs(currentTransaction.amount)
              );
              // subtract from current account
              this.accountService.updateAccountBalance(
                newTransaction.account.accountId,
                budgetId,
                Math.abs(newTransaction.amount)
              );
            }
          }

          // if the type has changed by changing the in or out values, ensure to update the budget values as well
          if (
            currentTransaction.amount !== newTransaction.amount &&
            currentTransaction.amount > 0
          ) {
            this.budgetService.updateBudgetBalance(
              budgetId,
              newTransaction.date,
              Math.abs(newTransaction.amount)
            );
            // subtract from current account
            this.accountService.updateAccountBalance(
              newTransaction.account.accountId,
              budgetId,
              Math.abs(newTransaction.amount)
            );
          } else if (
            currentTransaction.amount !== newTransaction.amount &&
            currentTransaction.amount <= 0
          ) {
            // subtract from current account
            this.accountService.updateAccountBalance(
              newTransaction.account.accountId,
              budgetId,
              -Math.abs(newTransaction.amount)
            );
          }
          const newTransObj = JSON.parse(JSON.stringify(newTransaction));
          dbTransaction.update(docRef, newTransObj);
        },
        error => {
          console.log(
            'There was an error updating the transaction: ' +
              budgetId +
              ' - ' +
              newTransaction.id +
              ' - ' +
              newTransaction.amount,
            error
          );
        }
      );
    });
  }

  createStartingBalance(accountId: string, budgetId: string, amount: number) {
    // load the account
    const request = forkJoin(
      this.categoryService.getCategory('STARTING_BALANCE', budgetId).pipe(take(1)),
      this.accountService.getAccount(accountId, budgetId).pipe(take(1))
    );

    request.subscribe(([category, account]) => {
      const transaction = new Transaction();

      transaction.categories = {
        STARTING_BALANCE: {
          categoryName: 'Starting balance',
          in: 0,
          out: 0
        }
      };
      transaction.account = {
        accountId: accountId,
        accountName: account.name
      };
      transaction.accountDisplayName = account.name;
      transaction.date = new Date();
      transaction.in = 0;
      transaction.out = 0;
      transaction.amount = amount;
      transaction.payee = 'Starting Balance';
      transaction.cleared = false;
      transaction.categoryDisplayName = 'Starting Balance';
      transaction.transfer = false;
      transaction.type = TransactionTypes.EXPENSE;

      return this.createTransaction(transaction, budgetId);
    });
  }

  calculateAmount(transaction: Transaction): number {
    let amount = 0;

    for (const key in transaction.categories) {
      if (transaction.categories.hasOwnProperty(key)) {
        const category = transaction.categories[key];
        const amountIn = +category.in,
          amountOut = +category.out;
        amount = amount + amountIn - amountOut;
      }
    }

    return amount;
  }

  /**
   * Creates a new transaction and updates the relevant paths with the correct
   * data sets
   *
   * TODO: This needs to be modelled :P
   *
   * @param  {any}    transaction [description]
   * @param  {string} userId      [description]
   * @param  {string} budgetId    [description]
   * @return {[type]}             [description]
   */
  createTransaction(transaction: Transaction, budgetId: string) {
    const items = this.db.collection<Transaction>('budgets/' + budgetId + '/transactions'),
      shortDate = moment(transaction.date).format('YYYYMM');

    return new Promise((resolve, reject) => {
      const transactionObj = JSON.parse(JSON.stringify(transaction));
      items.add(transactionObj).then(
        response => {
          // after successfull response, we update the account budgets (could go to cloud functions)
          this.accountService.updateAccountBalance(
            transaction.account.accountId,
            budgetId,
            transaction.amount
          );

          // after successfull response, we update the category budgets (could go to cloud functions)
          for (const key in transaction.categories) {
            if (transaction.categories.hasOwnProperty(key)) {
              const category = transaction.categories[key];
              this.categoryService.updateCategoryBudget(
                budgetId,
                key,
                shortDate,
                category.in,
                category.out
              );
            }
          }

          if (!transaction.transfer) {
            // after successfull response, we update the budget budgets (could go to cloud functions)
            this.budgetService.updateBudgetBalance(budgetId, transaction.date, transaction.amount);
          }
          resolve(response);
        },
        error => {
          reject(error);
        }
      );
    });
  }
}
