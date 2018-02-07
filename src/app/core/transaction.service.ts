import { Injectable } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import * as firebase from 'firebase';
import * as moment from 'moment';

import { Transaction } from '../shared/transaction';
import { Account } from '../shared/account';
import { Category } from '../shared/category';

@Injectable()
export class TransactionService {
  constructor(
    private db: AngularFirestore
  ) { }

  getTransactions(){
      return this.db.collection<Transaction>('/budgets/pPkN7QxRdyyvG4Jy2hr6/transactions').valueChanges();
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
  createTransaction(transaction: any, userId: string, budgetId: string) {
    let items = this.db.collection<Transaction>('budgets/' + budgetId + '/transactions');

    // ensure value is negative if it is an expense.
    if (transaction.type == "expense") {
      transaction.amount = -Math.abs(transaction.amount);
    } else {
      transaction.amount = Math.abs(transaction.amount);
    }

    let transactionItem = new Transaction({
      categoryId: transaction.category.$key,
      category: transaction.category.name,
      accountId: transaction.account.$key,
      account: transaction.account.name,
      amount: parseFloat(transaction.amount),
      type: transaction.type,
      payee: transaction.payee,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    });


    console.log('Transaction Item', transactionItem);
    console.log('Category Item', transaction.category);
    console.log('Account Item', transaction.account);
    items.add(transactionItem.toObject()).then(response => {
      // update the relevant account amount
      let updateObj = {};
      let thisMonth = moment().format("YYYYMM");
      let nextMonth = moment().add(1, 'months').format('YYYYMM');
      let allocRef = 'allocations/' + budgetId + '/' + thisMonth + '/' + transaction.category.$key;
      let allocNextRef = 'allocations/' + budgetId + '/' + nextMonth + '/' + transaction.category.$key;
      let accBalance: number = transaction.account.balance;
      let catBalance: number = transaction.category.balance;

      // check to make sure the value is a number to populate transaction details
      if (isNaN(accBalance)) {
        accBalance = 0;
      }

      // check to make sure the value is a number to populate transaction details
      if (isNaN(catBalance)) {
        catBalance = 0;
      }

      console.log('before', catBalance);

      accBalance += parseFloat(transaction.amount);
      catBalance += parseFloat(transaction.amount);

      console.log('after', catBalance);

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
