import { Injectable } from '@angular/core';
import { Category } from '../shared/category';
import { AngularFireDatabase } from 'angularfire2/database';
import * as firebase from 'firebase';

@Injectable()
export class CategoryService {
  constructor(
    private db: AngularFireDatabase
  ) {  }


  createCategory(budgetId: string, category: Category){
    let dbRef = this.db.list('categories/' + budgetId);
    let newCat = dbRef.push(category);
    // create a allocation

  }

  updateCategory(budgetId: string, category: Category){
    // update main category
    let dbRef = this.db.object('categories/' + budgetId + '/' + category.$key);
    console.log(category);
    // update allocations

    // update transactions
  }

  deleteCategory(budgetId: string, category: Category){

  }



}
