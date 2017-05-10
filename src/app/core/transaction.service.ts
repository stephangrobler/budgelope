import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';

import { Transaction } from '../shared/transaction';
import { Account } from '../shared/account';
import { Category } from '../shared/category';

@Injectable()
export class TransactionService {
  constructor(
    private db: AngularFireDatabase
  ) {  }

  createTransaction(transaction: any, userId: string, budgetId: string){
    let items = this.db.list('transactions/' + userId + '/' + budgetId);
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

      if (transaction.type == "expense"){
        accBalance -= transaction.amount;
        catBalance -= transaction.amount;
      } else if (transaction.type == "income"){
        accBalance += parseFloat(transaction.amount);
        catBalance += parseFloat(transaction.amount);
      }
      updateObj['accounts/' + budgetId + '/' + transaction.account.$key + '/balance'] = accBalance;
      updateObj['categories/' + userId + '/' + transaction.category.$key + '/balance'] = catBalance;

      this.db.object('/').update(updateObj);

    }).catch(error => {
      alert('there was an error creating the transaction.');
      console.log('ERROR:', error);
    });

    alert('Transaction saved');
  }
}
