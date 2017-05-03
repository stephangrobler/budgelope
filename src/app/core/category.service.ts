import { Injectable } from '@angular/core';
import { Category } from '../shared/category';
import * as firebase from 'firebase';

@Injectable()
export class CategoryService {
  constructor() {  }

  createCategory(category: Category){
    let dbRef = firebase.database().ref('categories/'+category.userId);
    let newCat = dbRef.push();

    newCat.set({
      name: category.name,
      parent: category.parent
    });
  }
}
