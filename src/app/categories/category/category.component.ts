import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';

import { Category } from '../../shared/category';
import { CategoryService } from '../../core/category.service';
import { UserService } from '../../shared/user.service';

@Component({
  templateUrl: 'category.component.html',
})
export class CategoryComponent implements OnInit {
  name: string;
  parent: string = "";
  categories: Category[];
  theUserId: string;

  constructor(
    private router: Router,
    private categoryService: CategoryService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.theUserId = this.userService.authUser.uid;
    this.getParentCategories();
  }

  /**
   * Gets the parent categories from firebase and filter only parents.
   * @return {void}
   */
  getParentCategories() {
    let dbRef = firebase.database().ref('categories/' + this.theUserId).orderByChild('order');
    dbRef.once('value').then((snapshot) => {
      let rawList = [];
      snapshot.forEach((categorySnap) => {
        let category = categorySnap.val();
        if (category.parent == "") {
          let cat = new Category();
          cat.name = category.name;
          cat.parent = category.parent;
          cat.id = categorySnap.key;
          rawList.push(cat);
        }
      });
      this.categories = rawList;
    });
  }

  saveCategory() {
    let category = new Category();
    category.name = this.name;
    category.parent = this.parent;
    category.userId = this.theUserId;

    this.categoryService.createCategory(category);
  }

  cancel() {
    this.router.navigate(['/categories']);
  }

}
