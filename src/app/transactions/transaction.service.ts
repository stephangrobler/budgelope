import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, take, last } from 'rxjs/operators';
import * as moment from 'moment';

import { ITransaction, Transaction, TransactionTypes, ITransactionID } from '../shared/transaction';
import { CategoryService } from '../categories/category.service';
import { AccountService } from '../accounts/account.service';
import { BudgetService } from '../budgets/budget.service';
import { FirebaseApp } from '@angular/fire';
import { IImportedTransaction } from './import/importedTransaction';

export interface IFilter {
  accountId: string;
  cleared: boolean;
  categoryId: string;
}

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
  getTransactions(budgetId: string, filter: IFilter): Observable<ITransactionID[]> {
    const transRef = '/budgets/' + budgetId + '/transactions';
    // should not display cleared transactions by default
    const collection = this.db.collection<ITransactionID>(transRef, ref => {
      let query: firebase.firestore.Query = ref;
      if (!filter.cleared) {
        query = query.where('cleared', '==', false);
      }
      if (filter.accountId) {
        query = query.where('account.accountId', '==', filter.accountId);
      }
      if (filter.categoryId) {
        query = query.where('categories.' + filter.categoryId + '.categoryName', '>=', '');
      } else {
        query = query.orderBy('date', 'desc');
      }
      return query;
    });

    return collection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as ITransactionID;
          const id = a.payload.doc.id;
          // convert timestamp object from firebase to date object if object
          const dateObj = a.payload.doc.get('date');
          if (typeof dateObj === 'string') {
            data.date = new Date(dateObj);
          } else if (typeof dateObj === 'object') {
            data.date = dateObj.toDate();
          }
          data.accountDisplayName = data.account.accountName;
          for (const prop in data.categories) {
            if (data.categories.hasOwnProperty(prop)) {
              data.categoryDisplayName = data.categories[prop].categoryName;
            }
          }
          if (data.type === TransactionTypes.INCOME) {
            data.in = data.amount;
          } else {
            // display here needs to be a positive number
            data.out = Math.abs(data.amount);
          }

          data.id = id;
          return { id, ...data };
        })
      )
    );
  }

  doMatching(currentTransactions: ITransaction[], importedTransactions: IImportedTransaction[]) {
    const matching = { matched: [], unmatched: [] };

    if (currentTransactions.length > 0 && typeof currentTransactions[0] === 'boolean') {
      return matching;
    }

    for (let i = 0; i < currentTransactions.length; i++) {
      const curTrans = currentTransactions[i];
      if (!curTrans) {
        continue;
      } else {
        for (let j = 0; j < importedTransactions.length; j++) {
          const importedTrans = importedTransactions[j];
          const dateDiff = moment(curTrans.date).diff(moment(importedTrans.dtposted), 'days');
          if (curTrans.amount === +importedTrans.trnamt && dateDiff > -6) {
            // flag current transactions as matched
            importedTransactions.splice(j, 1);
            j--;
            break;
          }
        }
      }
    }
    matching.matched = currentTransactions.slice();
    matching.unmatched = importedTransactions.slice();
    return matching;
    // commit batch
  }

  batchUpdateMatched(transactions: ITransactionID[], budgetId: string) {
    const batch = this.db.firestore.batch();
    transactions.forEach(transaction => {
      const ref = this.db.doc('/budgets/' + budgetId + '/transactions/' + transaction.id).ref;
      console.log(ref);
      batch.update(ref, { matched: moment(transaction.date).valueOf() });
    });

    batch.commit().then(response => console.log('Batch Committed:', response));
  }

  batchCreateTransactions(transactions: IImportedTransaction[], budgetId: string,
    accountId: string,
    accountName: string) {
    const batch = this.db.firestore.batch();
    let accAmount = 0, budgetAmount = 0, categoryAmount = 0;
    let shortDate = '', transDate;
    transactions.forEach(transaction => {
      const id = this.db.createId();
      const ref = this.db.doc('/budgets/' + budgetId + '/testtransactions/' + id).ref;
      // create transaction to write
      const transRec = <ITransactionID>{account: {}};
      transRec.account.accountId = accountId;
      transRec.account.accountName = accountName;
      transRec.amount = Number(transaction.trnamt);
      transRec.date = moment(transaction.dtposted).toDate();
      transRec.memo = transaction.memo;
      transRec.type =
        transaction.trntype === 'DEBIT' ? TransactionTypes.EXPENSE : TransactionTypes.INCOME;
      transRec.cleared = true;
      let inAmount = 0,
        outAmount = 0;
      if (transRec.type === TransactionTypes.INCOME) {
        inAmount = Math.abs(transRec.amount);
      } else {
        outAmount = Math.abs(transRec.amount);
      }
      transRec.categories = {
        UNCATEGORIZED: {
          categoryName: 'Uncategorized',
          in: inAmount,
          out: outAmount
        }
      };
      batch.set(ref, transRec);
      // count amount of account
      accAmount += transRec.amount;
      // count category amount values
      categoryAmount += transRec.amount;
      // count budget amount values
      budgetAmount += transRec.amount;
      shortDate = moment(transaction.dtposted).format('YYYYMM');
      transDate = moment(transaction.dtposted).toDate();
      // update all the things
    });
    return batch.commit().then(response => {
      this.accountService.updateAccountBalance(
        accountId,
        budgetId,
        accAmount
      );
      // after successfull response, we update the category budgets (could go to cloud functions)
      this.categoryService.updateCategoryBudget(
        budgetId,
        'UNCATEGORIZED',
        shortDate,
        0,
        accAmount
      );

      // after successfull response, we update the budget budgets (could go to cloud functions)
      this.budgetService.updateBudgetBalance(budgetId, transDate, accAmount);
    });
  }

  matchTransactions(
    budgetId: string,
    accountId: string,
    accountName: string,
    importedTransactions
  ) {
    const transRef = 'budgets/' + budgetId + '/transactions';
    this.db
      .collection(transRef)
      .snapshotChanges()
      .pipe(
        map(actions => {
          return actions.map(a => {
            // a.payload.doc.metadata.fromCache
            if (a.payload.doc.metadata.fromCache) {
              return false;
            }
            const data = a.payload.doc.data() as any;
            const id = a.payload.doc.id;
            if (a.payload.doc.get('id') === null) {
              data.id = id;
            }
            if (typeof data.date === 'object') {
              data.date = data.date.toDate();
            }
            return { id, ...data };
          });
        })
      )
      .subscribe(async val => {
        const transactions = val;
        const matchObject = this.doMatching(transactions, importedTransactions);
        // await this.batchCreateTransactions(matchObject.unmatched, budgetId, accountId, accountName);
      });
  }

  getTransaction(budgetId: string, transactionId: string): Observable<ITransaction> {
    const transRef = 'budgets/' + budgetId + '/transactions/' + transactionId;
    return this.db
      .doc<ITransaction>(transRef)
      .valueChanges()
      .pipe(
        map((transaction: ITransactionID) => {
          if (typeof transaction.date === 'string') {
            transaction.date = new Date(transaction.date);
          } else if (typeof transaction.date === 'object') {
            // transaction.date = transaction.date.toDate();
          }
          transaction.accountDisplayName = transaction.account.accountName;
          for (const prop in transaction.categories) {
            if (transaction.categories.hasOwnProperty(prop)) {
              transaction.categoryDisplayName = transaction.categories[prop].categoryName;
            }
          }
          return transaction;
        })
      );
  }

  removeTransaction(budgetId: string, transactionId: string) {
    const docRef = 'budgets/' + budgetId + '/transactions/' + transactionId;
    return new Promise((resolve, reject) => {
      this.db
        .doc<ITransaction>(docRef)
        .valueChanges()
        .pipe(take(1))
        .subscribe(transaction => {
          // get the opposite amount value
          const inverseAmount =
            transaction.amount > 0 ? -Math.abs(transaction.amount) : Math.abs(transaction.amount);
          const shortDate = moment(transaction.date).format('YYYYMM');
          // update account balance with the returned amount
          this.accountService.updateAccountBalance(
            transaction.account.accountId,
            budgetId,
            inverseAmount
          );

          // update the categories with the return values
          for (const key in transaction.categories) {
            if (transaction.categories.hasOwnProperty(key)) {
              const category = transaction.categories[key];
              this.categoryService.updateCategoryBudget(
                budgetId,
                key,
                shortDate,
                category.out,
                category.in
              );
            }
          }

          // update the budget of the return values
          this.budgetService.updateBudgetBalance(budgetId, transaction.date, inverseAmount);

          this.db
            .doc(docRef)
            .delete()
            .then(
              () => {
                resolve();
              },
              () => {
                reject();
              }
            );
        });
    });
  }

  updateClearedStatus(budgetId: string, transaction: ITransactionID) {
    this.db
      .doc('budgets/' + budgetId + '/transactions/' + transaction.id)
      .update({ cleared: transaction.cleared });

    if (!transaction.cleared) {
      transaction.amount =
        transaction.amount > 0 ? -Math.abs(transaction.amount) : Math.abs(transaction.amount);
    }

    this.accountService.updateClearedBalance(
      budgetId,
      transaction.account.accountId,
      transaction.amount
    );
  }

  updateTransaction(budgetId: string, newTransaction: Transaction) {
    const docRef = this.db.doc('budgets/' + budgetId + '/transactions/' + newTransaction.id).ref;
    return this.fb.firestore().runTransaction(dbTransaction => {
      return dbTransaction.get(docRef).then(
        readTransaction => {
          const currentTransaction = readTransaction.data();
          const amountDiffers = currentTransaction.amount !== newTransaction.amount;

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

          // check if the categories have changed and update where necessary
          const currentCategories = Object.keys(currentTransaction.categories);
          const newCategories = Object.keys(newTransaction.categories);
          const diffA = currentCategories.filter(t => newCategories.indexOf(t) === -1);
          const diffB = newCategories.filter(t => currentCategories.indexOf(t) === -1);

          const shortDate = moment(newTransaction.date).format('YYYYMM');

          // there is a difference, we revert all previous categories and apply the
          // new ones
          if (diffA.length > 0 || diffB.length > 0 || amountDiffers) {
            // reverse previous categories
            for (const key in currentTransaction.categories) {
              if (currentTransaction.categories.hasOwnProperty(key)) {
                const category = currentTransaction.categories[key];
                this.categoryService.updateCategoryBudget(
                  budgetId,
                  key,
                  shortDate,
                  category.out,
                  category.in
                );
              }
            }

            for (const key in newTransaction.categories) {
              if (newTransaction.categories.hasOwnProperty(key)) {
                const category = newTransaction.categories[key];
                this.categoryService.updateCategoryBudget(
                  budgetId,
                  key,
                  shortDate,
                  category.in,
                  category.out
                );
              }
            }
          }

          // if the type has changed by changing the in or out values,
          // ensure to update the budget values as well
          if (amountDiffers && currentTransaction.amount > 0) {
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
          } else if (amountDiffers && currentTransaction.amount <= 0) {
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
    this.accountService
      .getAccount(accountId, budgetId)
      .pipe(take(1))
      .subscribe(account => {
        const transaction = new Transaction();
        let inAmount, outAmount, type: string;

        if (amount > 0) {
          inAmount = Math.abs(amount);
          type = TransactionTypes.INCOME;
        } else {
          outAmount = Math.abs(amount);
          type = TransactionTypes.EXPENSE;
        }
        transaction.categories = {
          STARTING_BALANCE: {
            categoryName: 'Starting balance',
            in: inAmount,
            out: outAmount
          }
        };
        transaction.account = {
          accountId: accountId,
          accountName: account.name
        };
        transaction.accountDisplayName = account.name;
        transaction.date = new Date();
        transaction.amount = amount;
        transaction.payee = 'Starting Balance';
        transaction.cleared = false;
        transaction.categoryDisplayName = 'Starting Balance';
        transaction.transfer = false;
        transaction.type = type;

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
