import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DefaultDataService, HttpUrlGenerator, Logger } from '@ngrx/data';
import { Observable, of, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Transaction } from 'app/shared/transaction';
import { AngularFirestore } from '@angular/fire/firestore';
import { UserService } from 'app/shared/user.service';
import { Update } from '@ngrx/entity';

@Injectable()
export class TransactionDataService extends DefaultDataService<Transaction> {
  activeBudgetID: string;

  constructor(
    private db: AngularFirestore,
    http: HttpClient,
    httpUrlGenerator: HttpUrlGenerator,
    logger: Logger,
    private userService: UserService
  ) {
    super('Transaction', http, httpUrlGenerator);
    this.userService.getProfile().subscribe(profile => {
      this.activeBudgetID = profile.activeBudget;
    });
  }

  getAll(): Observable<Transaction[]> {
    const transRef = '/budgets/' + this.activeBudgetID + '/transactions';
    return this.db
      .collection<Transaction>(transRef)
      .snapshotChanges()
      .pipe(
        map(actions =>
          actions.map(a => {
            const data = a.payload.doc.data() as Transaction;
            const id = a.payload.doc.id;
            // convert timestamp object from firebase to date object if object
            const dateObj = a.payload.doc.get('date');
            if (typeof dateObj === 'string') {
              data.date = new Date(dateObj);
            } else if (typeof dateObj === 'object') {
              data.date = dateObj.toDate();
            }
            return { ...data, id };
          })
        )
      );
  }

  getById(id: string): Observable<Transaction> {
    return this.db
      .doc<Transaction>(
        'budgets/' + this.activeBudgetID + '/transactions/' + id
      )
      .snapshotChanges()
      .pipe(
        map(a => {
          const data = a.payload.data() as Transaction;
          // convert timestamp object from firebase to date object if object
          const dateObj = a.payload.get('date');
          if (typeof dateObj === 'string') {
            data.date = new Date(dateObj);
          } else if (typeof dateObj === 'object') {
            data.date = dateObj.toDate();
          }
          return { ...data, id };
        })
      );
  }

  getWithQuery(params: any): Observable<Transaction[]> {
    const transRef = '/budgets/' + this.activeBudgetID + '/transactions';
    // should not display cleared transactions by default
    const collection = this.db.collection<Transaction>(transRef, ref => {
      let query: firebase.firestore.Query = ref;
      if (params.cleared === 'false') {
        query = query.where('cleared', '==', false);
      }
      if (params.accountId) {
        query = query.where('account.id', '==', params.accountId);
      }
      if (params.categoryId) {
        query = query.where(
          'categories.' + params.categoryId + '.name',
          '>=',
          ''
        );
      }
      return query;
    });

    return collection.snapshotChanges().pipe(
      map(actions =>
        actions.map(a => {
          const data = a.payload.doc.data() as Transaction;
          const id = a.payload.doc.id;
          // convert timestamp object from firebase to date object if object
          const dateObj = a.payload.doc.get('date');
          if (typeof dateObj === 'string') {
            data.date = new Date(dateObj);
          } else if (typeof dateObj === 'object') {
            data.date = dateObj.toDate();
          }
          return { ...data, id };
        })
      ),
    );
  }

  add(transaction: Transaction): Observable<Transaction> {
    const colRef = '/budgets/' + this.activeBudgetID + '/transactions';
    return from(this.db.collection(colRef).add(transaction)).pipe(
      map(docRef => ({ id: docRef.id, ...transaction } as Transaction))
    );
  }

  update(transaction: Update<Transaction>): Observable<Transaction> {
    const docRef =
      '/budgets/' + this.activeBudgetID + '/transactions/' + transaction.id;
    return from(this.db.doc(docRef).update({ ...transaction.changes })).pipe(
      map(() => ({ id: transaction.id, ...transaction.changes } as Transaction))
    );
  }
}
