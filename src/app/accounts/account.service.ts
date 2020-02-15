import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { Account, IAccountId } from '../shared/account';
import { AngularFirestore } from '@angular/fire/firestore';
import {
  EntityCollectionServiceBase,
  EntityCollectionServiceElementsFactory
} from '@ngrx/data';

@Injectable()
export class AccountService extends EntityCollectionServiceBase<IAccountId> {
  constructor(
    private db: AngularFirestore,
    serviceElementsFactory: EntityCollectionServiceElementsFactory
  ) {
    super('Account', serviceElementsFactory);
  }

  updateClearedBalance(
    accountId: string,
    clearedAmount: number
  ): Observable<IAccountId> {
    return this.getByKey(accountId).pipe(
      take(1),
      switchMap(account => {
        const newBalance = account.clearedBalance + clearedAmount;
        return this.update({ ...account, clearedBalance: newBalance });
      })
    );
  }

  /**
   * Updates the balance of an account in a transaction
   *
   */
  public updateAccountBalance(
    accountId: string,
    amount: number
  ): Observable<IAccountId> {
    return this.getByKey(accountId).pipe(
      take(1),
      switchMap(account => {
        const newBalance = Number(account.balance) + Number(amount);
        return this.update({ ...account, balance: newBalance });
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
