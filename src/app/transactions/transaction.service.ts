import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, take } from 'rxjs/operators';
import * as moment from 'moment';
import * as firebase from 'firebase';

import { Transaction, TransactionTypes } from '../shared/transaction';
import { Account } from '../shared/account';
import { Budget } from '../shared/budget';
import { CategoryService } from '../categories/category.service';
import { AccountService } from '../accounts/account.service';
import { BudgetService } from '../budgets/budget.service';
import { FirebaseApp } from 'angularfire2';

@Injectable()
export class TransactionService {
  transactions: Transaction[];

  constructor(
    private db: AngularFirestore,
    private fb: FirebaseApp,
    private categoryService: CategoryService,
    private accountService: AccountService,
    private budgetService: BudgetService
  ) {}

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
          if (data.categories && data.categories.length > 1) {
            data.categoryDisplayName = 'Split (' + data.categories.length + ')';
          } else if (data.categories && data.categories.length === 1) {
            data.categoryDisplayName = data.categories[0].categoryName;
          }

          data.id = id;
          return { id, ...data };
        })
      )
    );
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

  updateTransaction(budgetId: string, transactionParam: Transaction) {
    const docRef = this.db.doc('budgets/' + budgetId + '/transactions/' + transactionParam.id).ref;
    console.log(transactionParam);
    this.fb.firestore().runTransaction(dbTransaction => {
      return dbTransaction.get(docRef).then(
        readTransaction => {
          const transactionOld = readTransaction.data();
          // check if the account has changed
          if (
            transactionOld.account &&
            transactionOld.account.accountId !== transactionParam.account.accountId
          ) {
            // if it was a expense/negative number
            if (transactionOld.amount < 0) {
              // add the amount to the previous account
              this.accountService.updateAccountBalance(
                transactionOld.account.accountId,
                budgetId,
                Math.abs(transactionOld.amount)
              );
              // subtract from current account
              this.accountService.updateAccountBalance(
                transactionParam.account.accountId,
                budgetId,
                -Math.abs(transactionParam.amount)
              );
            } else {
              // add the amount to the previous account
              this.accountService.updateAccountBalance(
                transactionOld.account.accountId,
                budgetId,
                -Math.abs(transactionOld.amount)
              );
              // subtract from current account
              this.accountService.updateAccountBalance(
                transactionParam.account.accountId,
                budgetId,
                Math.abs(transactionParam.amount)
              );
            }
          }

          dbTransaction.update(docRef, transactionParam.toObject);
        },
        error => {
          console.log(
            'There was an error updating the budget: ' +
              budgetId +
              ' - ' +
              transactionParam.id +
              ' - ' +
              transactionParam.amount,
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
      transaction.categories = [];
      transaction.categories.push({
        categoryId: 'STARTING_BALANCE',
        categoryName: 'Starting balance',
        in: 0,
        out: 0
      });
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
    transaction.categories.forEach(category => {
      const amountIn = +category.in,
        amountOut = +category.out;
      amount = amount + amountIn - amountOut;
    });

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
      items.add(transaction.toObject).then(
        response => {
          // after successfull response, we update the account budgets (could go to cloud functions)
          this.accountService.updateAccountBalance(
            transaction.account.accountId,
            budgetId,
            transaction.amount
          );

          // after successfull response, we update the category budgets (could go to cloud functions)
          transaction.categories.forEach(category => {
            this.categoryService.updateCategoryBudget(
              budgetId,
              category.categoryId,
              shortDate,
              category.in,
              category.out
            );
          });
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
