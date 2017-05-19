import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';
import * as moment from 'moment';

import { Transaction } from '../shared/transaction';
import { Account } from '../shared/account';
import { Category } from '../shared/category';

@Injectable()
export class TransactionService {
  constructor(
    private db: AngularFireDatabase
  ) {  }

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
  createTransaction(transaction: any, userId: string, budgetId: string){
    let items = this.db.list('transactions/' + budgetId);

    // ensure value is negative if it is an expense.
    if (transaction.type == "expense"){
      transaction.amount = -Math.abs(transaction.amount);
    } else {
      transaction.amount = Math.abs(transaction.amount);
    }

    let transactionItem = {
      categoryId: transaction.category.$key,
      category: transaction.category.name,
      accountId: transaction.account.$key,
      account: transaction.account.name,
      amount: parseFloat(transaction.amount),
      type: transaction.type,
      payee: transaction.payee,
      timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    items.push(transactionItem).then(response => {
      // update the relevant account amount
      let updateObj = {};
      let thisMonth = moment().format("YYYYMM");
      let nextMonth = moment().add(1, 'months').format('YYYYMM');
      let allocRef = 'categoryAllocations/'+budgetId+'/'+thisMonth+'/'+transaction.category.$key;
      let allocNextRef = 'categoryAllocations/'+budgetId+'/'+nextMonth+'/'+transaction.category.$key;
      let accBalance: number = transaction.account.balance;
      let catBalance: number = transaction.category.balance;




      // check to make sure the value is a number to populate transaction details
      if (isNaN(accBalance)){
        accBalance = 0;
      }

      // check to make sure the value is a number to populate transaction details
      if (isNaN(catBalance)){
        catBalance = 0;
      }

      accBalance += parseFloat(transaction.amount);
      catBalance += parseFloat(transaction.amount);

      updateObj['accounts/' + budgetId + '/' + transaction.account.$key + '/balance'] = accBalance;
      updateObj['categories/' + budgetId + '/' + transaction.category.$key + '/balance'] = catBalance;

      this.db.object('/').update(updateObj);

      let allocationupdate = this.db.object(allocRef);
      allocationupdate.take(1).subscribe(alloc => {
        this.db.object(allocRef).update({
          actual: alloc.actual + parseFloat(transaction.amount),
          balance: catBalance
        });
      });

      let allocationNextupdate = this.db.object(allocRef);
      allocationNextupdate.take(1).subscribe(alloc => {
        this.db.object(allocNextRef).update({
          previousBalance: catBalance
        });
      });
      
      console.log(updateObj);
      alert('Transaction saved');
    }).catch(error => {
      alert('there was an error creating the transaction.');
      console.log('ERROR:', error);
    });


  }
}
