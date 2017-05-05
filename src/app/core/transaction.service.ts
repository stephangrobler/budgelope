import { Injectable } from '@angular/core';
import * as firebase from 'firebase';

import { Transaction } from '../shared/transaction';

@Injectable()
export class TransactionService {
  constructor() {  }

  createTransaction(transaction: Transaction, userId: string, budgetId: string){
    let dbRef = firebase.database().ref('transactions/'+userId + '/' + budgetId);
    let newTrans = dbRef.push();

    newTrans.set({
      categoryId: transaction.categoryId,
      category: transaction.category,
      accountId: transaction.accountId,
      account: transaction.account,
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      amount: transaction.amount,
      payeeId: transaction.payeeId
    });
    alert('Transaction saved');
  }
}
