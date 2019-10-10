import { Injectable } from '@angular/core';
import { Category, CategoryId } from '../shared/category';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FirebaseApp } from '@angular/fire';
import { EntityCollectionServiceBase, EntityCollectionServiceElementsFactory } from '@ngrx/data';

@Injectable()
export class CategoryService extends EntityCollectionServiceBase<CategoryId> {
  constructor(
    private db: AngularFirestore,
    private fb: FirebaseApp,
    serviceElementsFactory: EntityCollectionServiceElementsFactory
  ) {
    super('Category', serviceElementsFactory);
  }

  getCategory(categoryId: string, budgetId: string) {
    const ref = 'budgets/' + budgetId + '/categories/' + categoryId;
    return this.db.doc<Category>(ref).valueChanges();
  }

  updateCategoryBudget(
    budgetId: string,
    categoryId: string,
    shortDate: string,
    inAmount: number,
    outAmount: number
  ) {
    const docRef = this.db.doc('budgets/' + budgetId + '/categories/' + categoryId).ref;

    this.fb.firestore().runTransaction(transaction => {
      return transaction.get(docRef).then(
        categoryRaw => {
          const category = categoryRaw.data() as Category;

          if (!category['allocations']) {
            category['allocations'] = {};
          }
          const amount = inAmount - outAmount;
          category['balance'] += amount;

          if (!category['allocations'][shortDate]) {
            category['allocations'][shortDate] = {
              actual: 0,
              planned: 0
            };
          }
          category['allocations'][shortDate].actual += amount;
          transaction.update(docRef, category);
        },
        error => {
          console.log(
            'There was an error updating the category: ' +
              budgetId +
              ' - ' +
              categoryId +
              ' - ' +
              shortDate +
              ' - ' +
              inAmount +
              ' - ' +
              outAmount,
            error
          );
        }
      );
    });
  }

  updateCategory(budgetId: string, categoryParam: Category) {
    const docRef = 'budgets/' + budgetId + '/categories/' + categoryParam.id;

    return this.db.doc(docRef).update(categoryParam);
  }

  deleteCategory(budgetId: string, category: Category) {}

  copyCategories(fromBudgetId: string, toBudgetId: string) {
    const fromStore = 'budgets/' + fromBudgetId + '/categories',
      toStore = 'budgets/' + toBudgetId + '/categories';
    const collections = this.db
      .collection<Category>(fromStore)
      .snapshotChanges()
      .pipe(
        map(actions => {
          return actions.map(cat => {
            const data = cat.payload.doc.data() as Category;
            const id = cat.payload.doc.id;
            data.balance = 0;
            data.allocations = {};
            data.parentId = '';

            return { id, ...data };
          });
        })
      )
      .subscribe(cats => {
        cats.forEach(item => {
          const doc = this.db.collection(toStore).doc(item.id);
          delete item.id;
          doc.set(item);
        }, this);
      });
  }
}
