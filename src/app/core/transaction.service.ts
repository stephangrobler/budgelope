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
    let accRef = firebase.database().ref('accounts/'+budgetId+'/'+transaction.accountId);

    let acc = accRef.once('value', (account) => {
      let accVal = account.val();
      let  balance: number = parseFloat(accVal.balance);
      console.log(accVal, balance);
      if (transaction.type == 'expense'){
        balance -= transaction.amount;
      } else if (transaction.type == 'income') {        
        balance = balance + parseFloat(transaction.amount.toString());
      }
      accVal.balance = balance;
      console.log('accVal', accVal, balance);
      firebase.database().ref('accounts/'+budgetId+'/'+transaction.accountId).update(accVal);
    });

    alert('Transaction saved');
  }
}
