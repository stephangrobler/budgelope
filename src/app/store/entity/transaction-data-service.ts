import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DefaultDataService, HttpUrlGenerator, Logger } from '@ngrx/data';

import { Observable, of, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  TransactionID,
  TransactionTypes,
  TransactionClass
} from 'app/shared/transaction';
import { AngularFirestore } from '@angular/fire/firestore';
import { UserService } from 'app/shared/user.service';
import { Update } from '@ngrx/entity';

@Injectable()
export class TransactionDataService extends DefaultDataService<TransactionID> {
  activeBudgetID: string;

  constructor(
    private db: AngularFirestore,
    http: HttpClient,
    httpUrlGenerator: HttpUrlGenerator,
    logger: Logger,
    private userService: UserService
  ) {
    super('ITransaction', http, httpUrlGenerator);
    logger.log('Created custom Transaction EntityDataService');
    this.userService.getProfile().subscribe(profile => {
      this.activeBudgetID = profile.activeBudget;
      logger.log(
        'TransactionService -> this.activeBudgetID:',
        this.activeBudgetID
      );
    });
  }

  getAll(): Observable<TransactionID[]> {
    const transRef = '/budgets/' + this.activeBudgetID + '/transactions';
    return this.db.collection<TransactionID>(transRef).valueChanges();
  }

  getById(id: string): Observable<TransactionID> {
    return this.db
      .doc<TransactionID>(
        'budgets/' + this.activeBudgetID + '/transactions/' + id
      )
      .valueChanges();
  }

  getWithQuery(params: any): Observable<TransactionID[]> {
    const transRef = '/budgets/' + this.activeBudgetID + '/transactions';
    // should not display cleared transactions by default
    const collection = this.db.collection<TransactionID>(transRef, ref => {
      let query: firebase.firestore.Query = ref;
      if (!params.cleared) {
        query = query.where('cleared', '==', false);
      }
      if (params.accountId) {
        query = query.where('account.accountId', '==', params.accountId);
      }
      if (params.categoryId) {
        query = query.where(
          'categories.' + params.categoryId + '.categoryName',
          '>=',
          ''
        );
      } else {
        query = query.orderBy('date', 'desc');
      }
      return query;
    });

    return collection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as TransactionID;
          const id = a.payload.doc.id;
          // convert timestamp object from firebase to date object if object
          const dateObj = a.payload.doc.get('date');
          if (typeof dateObj === 'string') {
            data.date = new Date(dateObj);
          } else if (typeof dateObj === 'object') {
            data.date = dateObj.toDate();
          }
          data.accountDisplayName = data.account.accountName;
          for (const prop in data.categories) {
            if (data.categories.hasOwnProperty(prop)) {
              data.categoryDisplayName = data.categories[prop].categoryName;
            }
          }
          if (data.type === TransactionTypes.INCOME) {
            data.in = data.amount;
          } else {
            // display here needs to be a positive number
            data.out = Math.abs(data.amount);
          }
          return { ...data, id };
        })
      ),
      tap(response => {
        console.log('Data Changes:', response, params);
      })
    );
  }

  add(transaction: TransactionID): Observable<TransactionID> {
    const colRef = '/budgets/' + this.activeBudgetID + '/transactions';
    return from(this.db.collection(colRef).add(transaction)).pipe(
      map(docRef => ({ id: docRef.id, ...transaction } as TransactionID))
    );
  }

  update(transaction: Update<TransactionID>): Observable<TransactionID> {
    const docRef =
      '/budgets/' + this.activeBudgetID + '/transactions/' + transaction.id;
    return from(this.db.doc(docRef).update({ ...transaction.changes })).pipe(
      map(
        () => ({ id: transaction.id, ...transaction.changes } as TransactionID)
      )
    );
  }
}
