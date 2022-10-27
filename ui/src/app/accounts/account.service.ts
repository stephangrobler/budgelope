import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  filter,
  flatMap,
  map,
  mergeMap,
  switchMap,
  take,
} from 'rxjs/operators';
import { IAccount } from '../shared/account';
import { AngularFirestore } from '@angular/fire/firestore';
import {
  EntityCollectionServiceBase,
  EntityCollectionServiceElementsFactory,
} from '@ngrx/data';

@Injectable()
export class AccountService extends EntityCollectionServiceBase<IAccount> {
  constructor(serviceElementsFactory: EntityCollectionServiceElementsFactory) {
    super('Account', serviceElementsFactory);
  }

  updateClearedBalance(
    accountId: string,
    clearedAmount: number
  ): Observable<IAccount> {
    return this.getByKey(accountId).pipe(
      take(1),
      switchMap((account) => {
        const newBalance = account.clearedBalance + clearedAmount;
        console.log('SFG: AccountService -> newBalance', newBalance);
        return this.update({ ...account, clearedBalance: newBalance });
      })
    );
  }

  /**
   * Updates the balance of an account in a transaction
   *
   */
  public updateAccountBalance(accountId: string, amount: number) {
    return this.entities$.pipe(
      mergeMap((data) => data),
      filter((accounts) => accounts._id === accountId),
      take(1),
      switchMap((account) => {
        const balance = account.balance + amount;
        return this.update({ ...account, balance });
      })
    );
  }

  changeAccount(fromAccountID: string, toAccountID: string, amount: number) {}

  /** Copy accounts from a budget to another specified budget
   */
  copyAccounts(currentBudgetId: string, toBudgetId: string) {
    const fromRef = 'budgets/' + currentBudgetId + '/accounts';
  }
}
