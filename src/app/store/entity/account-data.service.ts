import { Injectable } from '@angular/core';
import { DefaultDataService, HttpUrlGenerator, Logger } from '@ngrx/data';
import { AngularFirestore } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { Account, IAccount, IAccountId } from 'app/shared/account';
import { Observable, of, from } from 'rxjs';
import { UserService } from 'app/shared/user.service';
import { map, switchMap, tap } from 'rxjs/operators';
import { Update } from '@ngrx/entity';

@Injectable({
  providedIn: 'root'
})
export class AccountDataService extends DefaultDataService<Account> {
  activeBudgetID: string;

  constructor(
    public db: AngularFirestore,
    http: HttpClient,
    httpUrlGenerator: HttpUrlGenerator,
    logger: Logger,
    private userService: UserService
  ) {
    super('Account', http, httpUrlGenerator);
    this.userService.getProfile().subscribe(profile => {
      this.activeBudgetID = profile.activeBudget;
    });
  }

  getAll(): Observable<IAccountId[]> {
    const accountRef = '/budgets/' + this.activeBudgetID + '/accounts';
    return this.db
      .collection<Account>(accountRef)
      .snapshotChanges()
      .pipe(
        map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data() as Account;
            const id = a.payload.doc.id;
            return { id, ...data };
          });
        })
      );
  }

  getById(id: string): Observable<IAccountId> {
    const docRef = 'budgets/' + this.activeBudgetID + '/accounts/' + id;
    return this.db
      .doc(docRef)
      .snapshotChanges()
      .pipe(
        map(snapShot => {
          const data = snapShot.payload.data() as Account;
          const docId = snapShot.payload.id;
          return { id: docId, ...data };
        })
      );
  }

  getWithQuery(params: any): Observable<IAccountId[]> {
    return this.db
      .collection<Account>(
        'budgets/' + this.activeBudgetID + '/categories',
        ref => ref.orderBy(params.orderBy)
      )
      .snapshotChanges()
      .pipe(
        map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data() as Account;
            const id = a.payload.doc.id;
            return { id, ...data };
          });
        })
      );
  }

  update(account: Update<IAccountId>): Observable<IAccountId> {
    const docRef = 'budgets/' + this.activeBudgetID + '/accounts/' + account.id;
    this.db.doc(docRef).update(account.changes);
    return of(account.changes as Account);
  }

  add(account: IAccount): Observable<IAccountId> {
    const collRef = 'budgets/' + this.activeBudgetID + '/accounts';
    return from(this.db.collection(collRef).add({ ...account })).pipe(
      switchMap(docRef => {
        return of({ id: docRef.id, ...account });
      })
    );
  }
}
