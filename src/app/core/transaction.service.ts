import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import * as firebase from 'firebase';
import * as moment from 'moment';

import { Transaction } from '../shared/transaction';
import { Account } from '../shared/account';
import { Category } from '../shared/category';
import { Payee } from '../shared/payee';

@Injectable()
export class TransactionService {
  constructor(
    private db: AngularFirestore
  ) { }

  getTransactions() {
    return this.db.collection<Transaction>('/budgets/pPkN7QxRdyyvG4Jy2hr6/transactions', ref => ref.orderBy('date', 'desc')).valueChanges();
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
  createTransaction(transaction: Transaction, account: Account, category: Category, payee: Payee, userId: string, budgetId: string) {
    let items = this.db.collection<Transaction>('budgets/' + budgetId + '/transactions'),
      catStore = this.db.doc<Category>('budgets/' + budgetId + '/categories/' + category.id),
      accStore = this.db.doc<Account>('budgets/' + budgetId + '/accounts/' + account.id);

    // ensure value is negative if it is an expense.
    if (transaction.in > 0) {
      transaction.amount = Math.abs(transaction.in);
    } else {
      transaction.amount = -Math.abs(transaction.out);
    }

    let transactionItem = new Transaction({
      categoryId: transaction.categoryId,
      category: transaction.category,
      accountId: transaction.accountId,
      account: transaction.account,
      amount: transaction.amount,
      in: transaction.in,
      out: transaction.out,
      type: transaction.type,
      payee: transaction.payee,
      date: transaction.date,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    });


    items.add(transactionItem.toObject()).then(response => {

      account.balance += transaction.amount;
      category.balance += transaction.amount;

      accStore.update(account);
      catStore.update(category);


      // updateObj['accounts/' + budgetId + '/' + transaction.account.$key + '/balance'] = accBalance;
      // updateObj['categories/' + budgetId + '/' + transaction.category.$key + '/balance'] = catBalance;
      //
      // this.db.object('/').update(updateObj);
      //
      // let allocationupdate = this.db.object<any>(allocRef);
      // allocationupdate.valueChanges().take(1).subscribe(alloc => {
      //   this.db.object<any>(allocRef).update({
      //     actual: alloc.actual + parseFloat(transaction.amount),
      //     balance: catBalance
      //   }).then((result) => {
      //     console.log('successfull update allocation ', allocRef, alloc);
      //   });
      // });

      // let allocationNextupdate = this.db.object<any>(allocNextRef);
      // allocationNextupdate.valueChanges().take(1).subscribe(alloc2 => {
      //   this.db.object(allocNextRef).update({
      //     previousBalance: catBalance
      //   }).then((result) => {
      //     console.log('successfull update allocation 2 ', allocNextRef, alloc2);
      //   });
      // });

      console.log(updateObj);
      alert('Transaction saved');
    });


  }
}
