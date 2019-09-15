import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  EntityCollectionDataService,
  DefaultDataService,
  HttpUrlGenerator,
  Logger,
  QueryParams
} from '@ngrx/data';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ITransaction, ITransactionID, TransactionTypes } from 'app/shared/transaction';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable()
export class TransactionDataService extends DefaultDataService<ITransactionID> {
  constructor(
    private db: AngularFirestore,
    http: HttpClient,
    httpUrlGenerator: HttpUrlGenerator,
    logger: Logger
  ) {
    super('ITransaction', http, httpUrlGenerator);
    logger.log('Created custom Transaction EntityDataService');
  }

  getAll(): Observable<ITransactionID[]> {
    // return super.getAll().pipe(map(heroes => heroes.map(hero => this.mapHero(hero))));
    return of([] as ITransactionID[]);
  }

  getById(id: string | number): Observable<ITransactionID> {
    return super.getById(id).pipe(map(transaction => this.maptransaction(transaction)));
  }

  getWithQuery(params: any): Observable<ITransactionID[]> {
    // return super.getWithQuery(params).pipe(map(transactiones => transactiones.map(transaction => this.maptransaction(transaction))));
    const transRef = '/budgets/' + params.budgetId + '/transactions';
    // should not display cleared transactions by default
    const collection = this.db.collection<ITransactionID>(transRef, ref => {
      let query: firebase.firestore.Query = ref;
      if (!params.cleared) {
        query = query.where('cleared', '==', false);
      }
      if (params.accountId) {
        query = query.where('account.accountId', '==', params.accountId);
      }
      if (params.categoryId) {
        query = query.where('categories.' + params.categoryId + '.categoryName', '>=', '');
      } else {
        query = query.orderBy('date', 'desc');
      }
      return query;
    });

    return collection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as ITransactionID;
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

          data.id = id;
          return { id, ...data };
        })
      )
    );
  }

  private maptransaction(transaction: ITransactionID): ITransactionID {
    return { ...transaction };
  }
}
