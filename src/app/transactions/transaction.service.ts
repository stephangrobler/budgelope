import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import * as firebase from 'firebase';
import * as moment from 'moment';

import { Transaction } from '../shared/transaction';
import { Account } from '../shared/account';
import { Category } from '../shared/category';
import { Payee } from '../shared/payee';
import { Budget } from '../shared/budget';
import { CategoryService } from '../categories/category.service';

@Injectable()
export class TransactionService {
  transactions: Transaction[];

  constructor(private db: AngularFirestore, private categoryService: CategoryService) {}

  /**
   * Get all transactions with the id of the transactions
   * @param  budgetId Current active budget for the user id
   * @return          the observable for the transactions.
   */
  getTransactions(budgetId: string): Observable<Transaction[]> {
    const transRef = '/budgets/' + budgetId + '/transactions';

    return this.db
      .collection<Transaction>(transRef, ref => ref.orderBy('date', 'desc'))
      .snapshotChanges()
      .pipe(
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

  updateAccount(
    budgetId: string,
    currentTransaction: Transaction,
    currentAccount: Account,
    newAccount: Account
  ) {
    const accountRef = 'budgets/' + budgetId + '/accounts/' + currentTransaction.accountId;
    currentAccount.balance -= currentTransaction.amount;
    this.db.doc(accountRef).update(currentAccount);
    currentTransaction.accountName = newAccount.name;
    currentTransaction.accountId = newAccount.id;
    newAccount.balance += currentTransaction.amount;
    this.db.doc('budgets/' + budgetId + '/accounts/' + newAccount.id).update(newAccount);
  }

  updateTransaction(
    transactionId: string,
    transaction: Transaction,
    account: Account,
    category: Category,
    budget: Budget
  ) {
    let transactionStore = this.db.collection<Transaction>(
        'budgets/' + budget.id + '/transactions'
      ),
      currentDoc = transactionStore.doc<Transaction>(transactionId).valueChanges(),
      shortDate = moment(transaction.date).format('YYYYMM');

    // ensure value is negative if it is an expense.
    if (transaction.in > 0) {
      transaction.amount = Math.abs(transaction.in);
      // budget.balance += transaction.in;
      // budget.allocations[shortDate].income += transaction.in;
    } else {
      transaction.amount = -Math.abs(transaction.out);
      // budget.allocations[shortDate].expense += transaction.out;
    }

    currentDoc.pipe(take(1)).subscribe(currentTransaction => {
      // update accounts if changes were made to it
      if (account && account.id !== currentTransaction.accountId) {
        // load original account to reset values.
      }
      // update category if not the same as previous category
      if (category && category.id !== currentTransaction.categoryId) {
        let categoryRef = 'budgets/' + budget.id + '/categories';
        this.db
          .doc<Category>(categoryRef + '/' + currentTransaction.categoryId)
          .valueChanges()
          .pipe(take(1))
          .subscribe(currentCategory => {
            currentCategory.balance -= transaction.amount;
            this.db.doc(categoryRef + '/' + currentTransaction.categoryId).update(currentCategory);
          });
        transaction.categoryName = category.name;
        transaction.categoryId = category.id;
        category.balance += transaction.amount;
        this.db.doc(categoryRef + '/' + category.id).update(category);
      }
      // update amount if not the same as current transaction
      if (transaction.amount !== currentTransaction.amount) {
        if (transaction.in > 0) {
          budget.balance -= currentTransaction.in;
          budget.allocations[shortDate].income -= currentTransaction.in;

          budget.balance += transaction.in;
          budget.allocations[shortDate].income += transaction.in;
        } else if (transaction.out > 0) {
          account.balance -= currentTransaction.amount;
          category.balance -= currentTransaction.amount;
          category.allocations[shortDate].actual -= currentTransaction.amount;

          account.balance += transaction.amount;
          category.balance += transaction.amount;
          category.allocations[shortDate].actual += transaction.amount;

          budget.allocations[shortDate].expense -= currentTransaction.out;
          budget.allocations[shortDate].expense += transaction.out;
        }
      }
      transactionStore
        .doc(transactionId)
        .update(transaction)
        .then(docRef => {
          this.db.doc('budgets/' + budget.id + '/accounts/' + account.id).update(account);
          this.db
            .doc('budgets/' + budget.id + '/categories/' + currentTransaction.categoryId)
            .update(category);
        });
    });
  }

  createStartingBalance(account: Account, budget: Budget) {}

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
  createTransaction(
    transaction: Transaction,
    account: Account,
    categories: { category: Category; in: number; out: number }[],
    budget: Budget,
    userId: string,
    budgetId: string
  ) {
    let items = this.db.collection<Transaction>('budgets/' + budgetId + '/transactions'),
      accStore = this.db.doc<Account>('budgets/' + budgetId + '/accounts/' + account.id),
      shortDate = moment(transaction.date).format('YYYYMM'),
      budgetStore = this.db.doc<Budget>('budgets/' + budgetId);

    if (!budget.allocations[shortDate]) {
      budget.allocations[shortDate] = {
        expense: 0,
        income: 0
      };
    }

    // ensure value is negative if it is an expense.
    if (transaction.amount > 0) {
      budget.balance += transaction.amount;
      budget.allocations[shortDate].income += transaction.amount;
    } else {
      budget.allocations[shortDate].expense += Math.abs(transaction.amount);
    }

    return new Promise((resolve, reject) => {
      console.log('transaction', transaction.toObject);
      items.add(transaction.toObject).then(response => {
        account.balance += transaction.amount;
        categories.forEach(category => {
          this.categoryService.updateCategoryBudget(budgetId, category, shortDate);
        });
        accStore.update(account);

        budgetStore.update(budget);
        resolve(response);
      });
    });
  }
}
