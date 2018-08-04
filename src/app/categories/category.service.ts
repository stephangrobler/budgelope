import { Injectable } from '@angular/core';
import { Category, CategoryId } from '../shared/category';
import { AngularFirestore } from 'angularfire2/firestore';
import * as firebase from 'firebase';
import * as moment from 'moment';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class CategoryService {
  constructor(private db: AngularFirestore) {}

  getCategories(budgetId: string): Observable<CategoryId[]> {
    return this.db
      .collection<Category>('budgets/' + budgetId + '/categories', ref =>
        ref.orderBy('sortingOrder')
      )
      .snapshotChanges()
      .pipe(
        map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as CategoryId;
          const id = a.payload.doc.id;
          return { id, ...data };
        });
      }));
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
    let currentAllocationMonthRef = '/allocations/' + budgetId + '/' + month;
    let nextAllocationMonthRef = '/allocations/' + budgetId + '/' + nextMonth;
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
    category: { category: Category; in: number; out: number },
    shortDate: string
  ) {
    let catStore = this.db.doc<Category>(
      'budgets/' + budgetId + '/categories/' + category.category.id
    );
    let amount = 0 + category.in - category.out;

    category.category.balance += amount;
    if (!category.category.allocations[shortDate]) {
      category.category.allocations[shortDate] = {
        actual: 0,
        planned: 0
      };
    }
    category.category.allocations[shortDate].actual += amount;
    catStore.update(category.category);
  }

  updateCategory(budgetId: string, category: Category) {
    // update main category
    const dbRef = this.db.doc('categories/' + budgetId + '/' + category.$key);
    const categoryId = category.$key;

    // update allocations
    const updateObj = {};

    // get all allocations
    const allocationsRef = '/categoryAllocations/' + budgetId + '/' + categoryId;
    // update the allocations
    const allocationLocations = firebase
      .database()
      .ref(allocationsRef)
      .once('value')
      .then(results => {
        const allResults = results.val();
        // update allocations

        Object.keys(allResults).forEach(month => {
          // push all different items to the object
          let refAll = '/allocations/' + budgetId + '/' + month + '/' + categoryId;
          updateObj[refAll + '/sortingOrder'] = category.sortingOrder;
          updateObj[refAll + '/name'] = category.name;
          updateObj[refAll + '/parent'] = category.parent;
          updateObj[refAll + '/type'] = category.type;
        });
        return firebase
          .database()
          .ref('/')
          .update(updateObj)
          .then(() => {
            console.log('Update Category ' + categoryId + ':' + category.name + ' complete.');
          });
      });
  }

  deleteCategory(budgetId: string, category: Category) {}

  copyCategories(fromBudgetId: string, toBudgetId: string) {
    let fromStore = 'budgets/' + fromBudgetId + '/categories',
      toStore = 'budgets/' + toBudgetId + '/categories';
    let collections = this.db
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
          let doc = this.db.collection(toStore).doc(item.id);
          delete item.id;
          doc.set(item);
        }, this);
      });
  }
}
