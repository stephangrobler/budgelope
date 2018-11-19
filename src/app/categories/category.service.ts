import { Injectable } from '@angular/core';
import { Category, CategoryId } from '../shared/category';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import * as moment from 'moment';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { FirebaseApp } from '@angular/fire';

@Injectable()
export class CategoryService {
  constructor(private db: AngularFirestore, private fb: FirebaseApp) {}

  getCategories(budgetId: string, sortBy: string = 'sortingOrder'): Observable<CategoryId[]> {
    return this.db
      .collection<Category>('budgets/' + budgetId + '/categories', ref => ref.orderBy(sortBy))
      .snapshotChanges()
      .pipe(
        map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data() as CategoryId;
            const id = a.payload.doc.id;
            return { id, ...data };
          });
        })
      );
  }

  getCategory(categoryId: string, budgetId: string) {
    const ref = 'budgets/' + budgetId + '/categories/' + categoryId;
    console.log(ref);
    return this.db.doc<Category>(ref).valueChanges();
  }

  createCategory(budgetId: string, category: Category) {
    const dbRef = this.db.collection('categories/' + budgetId);
    const newCat = dbRef.add(category);
    const categoryId = 'newCat.key';
    // create a allocation
    // current allocation
    const currentDate = new Date();
    const month = moment().format('YYYYMM');
    const nextMonth = moment()
      .add(1, 'months')
      .format('YYYYMM');
    const catData = category;
    const allocData = {
      actual: 0,
      balance: 0,
      planned: 0,
      previousBalance: 0,
      name: catData.name,
      parent: catData.parent,
      sortingOrder: catData.sortingOrder,
      type: catData.type
    };
    const currentAllocationMonthRef = '/allocations/' + budgetId + '/' + month;
    const nextAllocationMonthRef = '/allocations/' + budgetId + '/' + nextMonth;
    return Promise.all([
      firebase
        .database()
        .ref(currentAllocationMonthRef)
        .child(categoryId)
        .set(allocData),
      firebase
        .database()
        .ref(nextAllocationMonthRef)
        .child(categoryId)
        .set(allocData),
      firebase
        .database()
        .ref('/categoryAllocations/' + budgetId + '/' + categoryId)
        .child(month)
        .set(true),
      firebase
        .database()
        .ref('/categoryAllocations/' + budgetId + '/' + categoryId)
        .child(nextMonth)
        .set(true)
    ]).then(() => {
      console.log('Created ' + catData.name + ' successfully!');
    });
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
