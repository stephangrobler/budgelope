import { Injectable } from '@angular/core';
import * as firebase from 'firebase';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Account } from '../shared/account';
import { Budget } from '../shared/budget';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { TransactionService } from '../transactions/transaction.service';
import { FirebaseApp } from 'angularfire2';

@Injectable()
export class AccountService {
  constructor(private db: AngularFirestore, private fb: FirebaseApp) {}

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

  /**
   * Updates the balance of an account in a transaction
   *
   * @param accountId The id of the account to be updated
   * @param budgetId The budget of which the account needs to be updated
   * @param amount The amount that the account needs to be updated with
   */
  updateAccountBalance(accountId: string, budgetId: string, amount: number) {
    const dbRef = 'budgets/' + budgetId + '/accounts/' + accountId;
    const docRef = this.db.doc(dbRef).ref;

    this.fb.firestore().runTransaction(transaction => {
      return transaction.get(docRef).then(
        account => {
          const newBalance = account.data().balance + amount;
          transaction.update(docRef, { balance: newBalance });
        },
        error => {
          console.log(
            'There was an error updating the balance of the account: ' +
              accountId +
              ' - ' +
              budgetId +
              ' - ',
            error
          );
        }
      );
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
