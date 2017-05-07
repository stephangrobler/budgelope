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
      payeeId: transaction.payeeId,
      payee: transaction.payee,
      cleared: transaction.cleared,
      type: transaction.type
    });

    // update the selected account
    //
    let accRef = firebase.database().ref('accounts/'+budgetId+'/'+transaction.accountId);
    let accVal;
    let acc = accRef.once('value', (account) => {
      accVal = account.val();
      if (transaction.type == 'expense'){
        accVal.current = parseFloat(accVal.current) - transaction.amount;
      } else if (transaction.type == 'income') {
        accVal.current = parseFloat(accVal.current) + transaction.amount;
      }
      console.log('accVal', accVal);
      firebase.database().ref('accounts/'+budgetId+'/'+transaction.accountId).update(accVal);
    });

    // dbRef.update(accVal);

    alert('Transaction saved');
  }
}
