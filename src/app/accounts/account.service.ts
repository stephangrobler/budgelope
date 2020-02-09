import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { Account, AccountType, IAccount, IAccountId } from '../shared/account';
import { AngularFirestore } from '@angular/fire/firestore';
import { FirebaseApp } from '@angular/fire';
import {
  EntityCollectionServiceBase,
  EntityCollectionServiceElementsFactory
} from '@ngrx/data';
import { AccountDataService } from 'app/store/entity/account-data.service';

@Injectable()
export class AccountService extends EntityCollectionServiceBase<IAccount> {
  constructor(
    private db: AngularFirestore,
    private fb: FirebaseApp,
    private accountData: AccountDataService,
    serviceElementsFactory: EntityCollectionServiceElementsFactory
  ) {
    super('Account', serviceElementsFactory);
  }

  createAccount(budgetId: string, account: IAccount): Promise<any> {
    const accountStore = this.db.collection<IAccount>(
      'budgets/' + budgetId + '/accounts'
    );
    // create the account with 0 balance as starting balance is created on the component where
    // the method call is made
    const accountObj = {
      name: account.name,
      balance: 0,
      clearedBalance: 0,
      type: AccountType.CHEQUE
    };

    return accountStore.add(accountObj);
  }

  updateClearedBalance(
    budgetId: string,
    accountId: string,
    clearedAmount: number
  ): void {
    const dbRef = 'budgets/' + budgetId + '/accounts/' + accountId;
    const docRef = this.db.doc<IAccount>(dbRef).ref;

    this.fb.firestore().runTransaction(dbTransaction => {
      return dbTransaction.get(docRef).then(
        account => {
          const newBalance = account.data().clearedBalance + clearedAmount;
          dbTransaction.update(docRef, { clearedBalance: newBalance });
        },
        error => {
          console.log(
            'There was an error updating the cleared balance of the account: ' +
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

  /**
   * Updates the balance of an account in a transaction
   *
   */
  public updateAccountBalance(
    accountId: string,
    amount: number
  ): Observable<IAccountId> {
    return this.accountData.getById(accountId).pipe(
      take(1),
      switchMap(account => {
        const newBalance = Number(account.balance) + Number(amount);
        return this.accountData.update({
          id: accountId,
          changes: { balance: newBalance }
        });
      })
    );
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
          const store = this.db
            .collection('budgets/' + toBudgetId + '/accounts')
            .doc(item.id);
          item.balance = 0;
          delete item.id;
          store.set(item);
        }, this);
      });
  }
}
