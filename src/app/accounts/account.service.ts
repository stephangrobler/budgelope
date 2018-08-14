import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Account } from '../shared/account';
import { Budget } from '../shared/budget';
import { AngularFirestore } from 'angularfire2/firestore';
import { TransactionService } from '../transactions/transaction.service';

@Injectable()
export class AccountService {
  constructor(private db: AngularFirestore) {}

  getAccounts(budgetId: string): Observable<Account[]> {
    return this.db
      .collection<Account>('budgets/' + budgetId + '/accounts')
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data() as Account;
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      );
  }

  createAccount(budget: Budget, account: Account) {
    const accountStore = this.db.collection<Account>('budgets/' + budget.id + '/accounts');
    // add account then add starting account balance transaction to update the budget
    // accountStore.add(account).then(docRef => {
    //   this.transactionService.createStartingBalance(account, budget);
    // });
  }

  updateAccount(update: Account, budgetId: string) {
    const dbRef = 'budgets/' + budgetId + '/accounts/' + update.id;

    this.db
      .doc(dbRef)
      .update({
        name: update.name,
        balance: update.balance
      })
      .then(result => {
        console.log('accountt updated', result);
      });
  }

  removeAccount(delAccount: Account) {
    const dbRef = firebase
      .database()
      .ref('accounts')
      .child(delAccount.id)
      .remove();
    alert('account deleted');
  }

  /** Copy accounts from a budget to another specified budget
   */
  copyAccounts(currentBudgetId: string, toBudgetId: string) {
    const fromRef = 'budgets/' + currentBudgetId + '/accounts';
    this.db
      .collection<Account>(fromRef)
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data() as Account;
            const id = a.payload.doc.id;
            return { id, ...data };
          })
        )
      )
      .subscribe(accounts => {
        accounts.forEach(function(item) {
          const store = this.db.collection('budgets/' + toBudgetId + '/accounts').doc(item.id);
          item.balance = 0;
          delete item.id;
          store.set(item);
        }, this);
      });
  }
}
