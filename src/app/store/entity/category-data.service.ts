import { Injectable } from '@angular/core';
import { DefaultDataService, Logger, HttpUrlGenerator } from '@ngrx/data';
import { Category } from 'app/shared/category';
import { AngularFirestore } from '@angular/fire/firestore';
import { HttpClient } from '@angular/common/http';
import { Observable, of, from } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { UserService } from 'app/shared/user.service';
import { Update } from '@ngrx/entity';

@Injectable({
  providedIn: 'root'
})
export class CategoryDataService extends DefaultDataService<Category> {
  activeBudgetID: string;

  constructor(
    private db: AngularFirestore,
    logger: Logger,
    httpClient: HttpClient,
    httpUrlGenerator: HttpUrlGenerator,
    private userService: UserService
  ) {
    super('Category', httpClient, httpUrlGenerator);
    // TODO: may cause concurrency issues
    this.userService.getProfile().subscribe(profile => {
      this.activeBudgetID = profile.activeBudget;
      logger.log(
        'CategoryService -> this.activeBudgetID:',
        this.activeBudgetID
      );
    });
  }

  getById(id: string): Observable<Category> {
    return this.db
      .doc<Category>('budgets/' + this.activeBudgetID + '/categories/' + id)
      .snapshotChanges()
      .pipe(
        map(actions => {
          const data = actions.payload.data() as Category;
          return { id, ...data };
        })
      );
  }

  getWithQuery(params: any): Observable<Category[]> {
    return this.db
      .collection<Category>(
        'budgets/' + this.activeBudgetID + '/categories',
        ref => ref.orderBy(params.orderBy)
      )
      .snapshotChanges()
      .pipe(
        map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data() as Category;
            const id = a.payload.doc.id;
            return { id, ...data };
          });
        })
      );
  }

  update(category: Update<Category>): Observable<Category> {
    const docRef =
      'budgets/' + this.activeBudgetID + '/categories/' + category.id;
    return from(this.db.doc(docRef).update(category.changes)).pipe(
      map(() => ({ ...category.changes, id: category.id } as Category))
    );
  }

  add(category: Category): Observable<Category> {
    const colRef = '/budgets/' + this.activeBudgetID + '/categories';
    return from(this.db.collection(colRef).add(category)).pipe(
      map(docRef => ({ id: docRef.id, ...category } as Category))
    );
  }
}
