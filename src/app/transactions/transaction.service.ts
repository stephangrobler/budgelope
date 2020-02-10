import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, take, last } from 'rxjs/operators';
import * as moment from 'moment';

import {
  ITransaction,
  Transaction,
  TransactionTypes,
  ITransactionID
} from '../shared/transaction';
import { CategoryService } from '../categories/category.service';
import { AccountService } from '../accounts/account.service';
import { BudgetService } from '../budgets/budget.service';
import { FirebaseApp } from '@angular/fire';
import { IImportedTransaction } from './import/importedTransaction';
import {
  EntityCollectionServiceBase,
  EntityCollectionServiceElementsFactory
} from '@ngrx/data';

export interface IFilter {
  accountId: string;
  cleared: boolean;
  categoryId: string;
}

@Injectable({ providedIn: 'root' })
export class TransactionService extends EntityCollectionServiceBase<
  ITransaction
> {
  transactions: Transaction[];

  constructor(
    serviceElementsFactory: EntityCollectionServiceElementsFactory,
    private db: AngularFirestore,
    private fb: FirebaseApp,
    private categoryService: CategoryService,
    private accountService: AccountService,
    private budgetService: BudgetService
  ) {
    super('Transaction', serviceElementsFactory);
  }

  doMatching(
    currentTransactions: ITransactionID[],
    importedTransactions: IImportedTransaction[]
  ) {
    const matching = { matched: [], unmatched: [], updated: [] };

    if (
      currentTransactions.length > 0 &&
      typeof currentTransactions[0] === 'boolean'
    ) {
      return matching;
    }

    for (let i = 0; i < currentTransactions.length; i++) {
      const curTrans = currentTransactions[i];
      if (!curTrans) {
        continue;
      } else {
        for (let j = 0; j < importedTransactions.length; j++) {
          const importedTrans = importedTransactions[j];
          const dateDiff = moment(curTrans.date).diff(
            moment(importedTrans.dtposted),
            'days'
          );
          if (curTrans.amount === +importedTrans.trnamt && dateDiff > -6) {
            if (curTrans.matched === null) {
              // flag current transactions as matched
              curTrans.matched = importedTrans;
              matching.updated.push(curTrans);
            }
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
      const ref = this.db.doc(
        '/budgets/' + budgetId + '/transactions/' + transaction.id
      ).ref;
      batch.update(ref, { matched: transaction.matched });
    });

    batch.commit().then(response => console.log('Batch Committed:', response));
  }

  batchCreateTransactions(
    transactions: IImportedTransaction[],
    budgetId: string,
    accountId: string,
    accountName: string
  ) {
    const batch = this.db.firestore.batch();
    let accAmount = 0,
      budgetAmount = 0,
      categoryAmount = 0;
    let shortDate = '',
      transDate;
    transactions.forEach(transaction => {
      const id = this.db.createId();
      const ref = this.db.doc('/budgets/' + budgetId + '/transactions/' + id)
        .ref;
      // create transaction to write
      const transRec = <ITransactionID>{ account: {} };
      transRec.account.accountId = accountId;
      transRec.account.accountName = accountName;
      transRec.amount = Number(transaction.trnamt);
      transRec.date = moment(transaction.dtposted).toDate();
      transRec.memo = transaction.memo;
      transRec.type =
        transaction.trntype === 'DEBIT'
          ? TransactionTypes.EXPENSE
          : TransactionTypes.INCOME;
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
    return batch.commit().then(async response => {
      await this.accountService
        .updateAccountBalance(accountId, accAmount)
        .toPromise();
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
      .collection(transRef, ref =>
        ref.where('account.accountId', '==', accountId)
      )
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
      .subscribe(async (val: ITransactionID[]) => {
        const transactions = val;
        const matchObject = this.doMatching(transactions, importedTransactions);
        if (matchObject.updated.length > 0) {
          this.batchUpdateMatched(matchObject.updated, budgetId);
        }
      });
  }

  removeTransaction(budgetId: string, transactionId: string) {
    return new Promise((resolve, reject) => {
      this.getByKey(transactionId)
        .pipe(take(1))
        .subscribe(async transaction => {
          // get the opposite amount value
          const inverseAmount =
            transaction.amount > 0
              ? -Math.abs(transaction.amount)
              : Math.abs(transaction.amount);
          const shortDate = moment(transaction.date).format('YYYYMM');
          // update account balance with the returned amount
          await this.accountService
            .updateAccountBalance(transaction.account.accountId, inverseAmount)
            .toPromise();

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
          this.budgetService.updateBudgetBalance(
            budgetId,
            transaction.date,
            inverseAmount
          );

          await this.delete(transaction).toPromise();
          resolve();
        });
    });
  }

  updateClearedStatus(budgetId: string, transaction: ITransactionID) {
    this.update(transaction);

    if (!transaction.cleared) {
      transaction.amount =
        transaction.amount > 0
          ? -Math.abs(transaction.amount)
          : Math.abs(transaction.amount);
    }

    this.accountService.updateClearedBalance(
      transaction.account.accountId,
      transaction.amount
    );
  }

  updateTransaction(budgetId: string, newTransaction: Transaction) {
    const docRef = this.db.doc(
      'budgets/' + budgetId + '/transactions/' + newTransaction.id
    ).ref;
    return this.fb.firestore().runTransaction(dbTransaction => {
      return dbTransaction.get(docRef).then(
        async readTransaction => {
          const currentTransaction = readTransaction.data();
          const amountDiffers =
            currentTransaction.amount !== newTransaction.amount;

          // check if the account has changed
          if (
            currentTransaction.account &&
            currentTransaction.account.accountId !==
              newTransaction.account.accountId
          ) {
            // if it was a expense/negative number
            if (currentTransaction.amount < 0) {
              // add the amount to the previous account
              await this.accountService
                .updateAccountBalance(
                  currentTransaction.account.accountId,
                  Math.abs(currentTransaction.amount)
                )
                .toPromise();
              // subtract from current account
              await this.accountService
                .updateAccountBalance(
                  newTransaction.account.accountId,
                  -Math.abs(newTransaction.amount)
                )
                .toPromise();
            } else {
              // add the amount to the previous account
              await this.accountService
                .updateAccountBalance(
                  currentTransaction.account.accountId,
                  -Math.abs(currentTransaction.amount)
                )
                .toPromise();
              // subtract from current account
              await this.accountService
                .updateAccountBalance(
                  newTransaction.account.accountId,
                  Math.abs(newTransaction.amount)
                )
                .toPromise();
            }
          }

          // check if the categories have changed and update where necessary
          const currentCategories = Object.keys(currentTransaction.categories);
          const newCategories = Object.keys(newTransaction.categories);
          const diffA = currentCategories.filter(
            t => newCategories.indexOf(t) === -1
          );
          const diffB = newCategories.filter(
            t => currentCategories.indexOf(t) === -1
          );

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
            await this.accountService
              .updateAccountBalance(
                newTransaction.account.accountId,
                Math.abs(newTransaction.amount)
              )
              .toPromise();
          } else if (amountDiffers && currentTransaction.amount <= 0) {
            // subtract from current account
            await this.accountService
              .updateAccountBalance(
                newTransaction.account.accountId,
                -Math.abs(newTransaction.amount)
              )
              .toPromise();
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
      .getByKey(accountId)
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
   */
  public async createTransaction(
    transaction: Transaction,
    budgetId: string
  ): Promise<any> {
    const shortDate = moment(transaction.date).format('YYYYMM');
    try {
      const savedTransaction = await this.add({ ...transaction }).toPromise();
      await this.accountService
        .updateAccountBalance(transaction.account.accountId, transaction.amount)
        .toPromise();
      for (const key in transaction.categories) {
        if (transaction.categories.hasOwnProperty(key)) {
          const category = transaction.categories[key];
          await this.categoryService.updateCategoryBudget(
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
        this.budgetService.updateBudgetBalance(
          budgetId,
          transaction.date,
          transaction.amount
        );
      }
      return savedTransaction;
    } catch (error) {
      console.log('SFG: createTransaction -> error', error);
    }
  }
}
