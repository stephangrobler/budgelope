import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Account } from '../shared/account';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirebaseApp } from '@angular/fire';

@Injectable()
export class AccountService {
  constructor(
    private db: AngularFirestore,
    private fb: FirebaseApp
  ) {}

  getAccounts(budgetId: string): Observable<Account[]> {
    if (!budgetId) {
      throw new Error('Budget ID must be set to retrieve accounts. BudgetID: ' + budgetId);
    }

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

  getAccount(accountId: string, budgetId: string) {
    const ref = 'budgets/' + budgetId + '/accounts/' + accountId;
    return this.db.doc<Account>(ref).valueChanges();
  }

  createAccount(budgetId: string, account: Account): Promise<any> {
    const accountStore = this.db.collection<Account>('budgets/' + budgetId + '/accounts');
    // create the account with 0 balance as starting balance is created on the component where
    // the method call is made
    const accountObj = {
      name: account.name,
      balance: 0,
      clearedBalance: 0
    };

    return accountStore.add(accountObj);
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
          const newBalance = Number(account.data().balance) + Number(amount);
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

  changeAccount(fromAccountID: string, toAccountID: string, amount: number) {}

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
