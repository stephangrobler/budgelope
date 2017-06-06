import { Injectable } from '@angular/core';
import { Category } from '../shared/category';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';
import * as moment from 'moment';

@Injectable()
export class CategoryService {
  constructor(
    private db: AngularFireDatabase
  ) {  }


  createCategory(budgetId: string, category: Category){
    let dbRef = this.db.list('categories/' + budgetId);
    let newCat = dbRef.push(category);
    let categoryId = newCat.key;
    // create a allocation
    // current allocation
    let currentDate = new Date();
    let month = moment().format('YYYYMM');
    let nextMonth = moment().add(1, 'months').format("YYYYMM");
    let catData = category;
    let allocData = {
      "actual": 0,
      "balance": 0,
      "planned": 0,
      "previousBalance": 0,
      "name": catData.name,
      "parent": catData.parent,
      "sortingOrder": catData.sortingOrder,
      "type": catData.type,
    }
    let currentAllocationMonthRef = '/allocations/' + budgetId + '/' + month;
    let nextAllocationMonthRef = '/allocations/' + budgetId + '/' + nextMonth;
    return Promise.all([
      firebase.database().ref(currentAllocationMonthRef).child(categoryId).set(allocData),
      firebase.database().ref(nextAllocationMonthRef).child(categoryId).set(allocData),
      firebase.database().ref('/categoryAllocations/' + budgetId + '/' + categoryId).child(month).set(true),
      firebase.database().ref('/categoryAllocations/' + budgetId + '/' + categoryId).child(nextMonth).set(true)
    ]).then(() => {
      console.log('Created ' + catData.name + ' successfully!');
    });

  }

  updateCategory(budgetId: string, category: Category){
    // update main category
    let dbRef = this.db.object('categories/' + budgetId + '/' + category.$key);
    let categoryId = category.$key;
    console.log(category);
    // update allocations
    let updateObj = {};

    // get all allocations
    let allocationsRef = '/categoryAllocations/' + budgetId + '/' + categoryId;
    // update the allocations
    let allocationLocations = firebase.database().ref(allocationsRef).once('value').then(results => {
      let allResults = results.val();
      // update allocations

      Object.keys(allResults).forEach(month => {
        // push all different items to the object
        let refAll = '/allocations/' + budgetId + '/' + month + '/' + categoryId;
        updateObj[refAll + '/sortingOrder'] = category.sortingOrder;
        updateObj[refAll + '/name'] = category.name;
        updateObj[refAll + '/parent'] = category.parent;
        updateObj[refAll + '/type'] = category.type;
      });
      return firebase.database().ref('/').update(updateObj).then(() => {
        console.log('Update Category ' + categoryId + ':' + category.name + ' complete.');
      });
    });
  }

  deleteCategory(budgetId: string, category: Category){

  }



}
