import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Observable } from 'rxjs/Observable';
import { Account } from '../shared/account';
import { Budget } from '../shared/budget';
import { AngularFirestore } from 'angularfire2/firestore';
import { TransactionService } from './transaction.service';

@Injectable()
export class AccountService {
  constructor(
    private db: AngularFirestore,
    private transactionService: TransactionService
  ) {

  }

  getAccounts(budgetId: string): Observable<Account[]> {
    return this.db.collection<Account>('budgets/' + budgetId + '/accounts').snapshotChanges()
      .map(actions => {
        let accounts = actions.map(a => {
          const data = a.payload.doc.data() as Account;
          const id = a.payload.doc.id;
          return { id, ...data };
        });
        return accounts;
      });
  }

  createAccount(budget: Budget, account: Account) {
    let accountStore = this.db.collection<Account>('budgets/'+budget.id+'/accounts');
    // add account then add starting account balance transaction to update the budget
    // accountStore.add(account).then(docRef => {
    //   this.transactionService.createStartingBalance(account, budget);
    // });
  }

  updateAccount(update: Account) {
    let dbRef = firebase.database().ref('accounts').child(update.id)
      .update({
        name: update.name,
        balance: update.balance
      });
    alert('account updated');
  }

  removeAccount(delAccount: Account) {
    let dbRef = firebase.database().ref('accounts').child(delAccount.id).remove();
    alert('account deleted');
  }

  /** Copy accounts from a budget to another specified budget
  */
  copyAccounts(currentBudgetId: string, toBudgetId: string) {
    let fromRef = 'budgets/' + currentBudgetId + '/accounts';
    this.db.collection<Account>(fromRef).snapshotChanges().map(actions => {
      return actions.map(a => {
        const data = a.payload.doc.data() as Account;
        const id = a.payload.doc.id;

        return { id, ...data };

      });

    }).subscribe(accounts => {
      accounts.forEach(function(item) {
        let store = this.db.collection('budgets/' + toBudgetId + '/accounts').doc(item.id);
        item.balance = 0;
        delete (item.id);
        store.set(item);
      }, this);
    })
  }
}
