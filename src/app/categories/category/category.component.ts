import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

import * as firebase from 'firebase';

import { Category } from '../../shared/category';
import { CategoryService } from '../../core/category.service';
import { UserService } from '../../shared/user.service';

@Component({
  templateUrl: 'category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  name: string;
  parent: Category;
  categories: Category[];
  childCounts: any;
  theUserId: string;
  activeBudget: string;
  categoryId: string;
  category: Category = new Category();

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private userService: UserService,
    private auth: AngularFireAuth,
    private db: AngularFireDatabase
  ) { }

  ngOnInit() {
    // get the category id from the route
    this.route.params.forEach((params: Params) => {
      this.categoryId = params['id'];
    });
    this.auth.authState.subscribe(user => {
      if (!user) {
        return;
      }
      this.db.object('users/' + user.uid).subscribe(profile => {
        this.activeBudget = profile.activeBudget;
        this.loadParentCategories(profile.activeBudget);
        if (this.categoryId != "add") {
          this.db.object('categories/' + profile.activeBudget + '/' + this.categoryId).subscribe(cat => {
            this.category = cat;

          });
        }
      });
    });
  }

  loadParentCategories(budgetId: string) {
    let parentCategories = this.db.list('categories/' + this.activeBudget);

    // get all the categories so that we can have counts to do the correct
    // saving and counts :P
    parentCategories.subscribe(catSnap => {

      let rawList = [];
      this.childCounts = {};
      catSnap.forEach((category) => {

        if (category.parent == "") {
          let cat = new Category();
          cat.name = category.name;
          cat.parent = category.parent;
          cat.sortingOrder = category.sortingOrder;
          cat.id = category.$key;
          rawList.push(cat);
          this.childCounts[category.name] = 0;
        } else {
            this.childCounts[category.parent] += 1;
        }
      });
      this.categories = rawList;
    });

  }

  saveCategory() {
    this.category.parent = this.parent.name;
    this.category.parentId = this.parent.id;
    this.category.type = this.category.type;
    if (this.categoryId == 'add') {
      this.category.sortingOrder = this.parent.sortingOrder + ':' + ("000" + (this.childCounts[this.parent.name] + 1)).slice(-3);
      this.categoryService.createCategory(this.activeBudget, this.category);
    } else {
      let dbRef = this.db.object('categories/' + this.activeBudget + '/' + this.category.$key).update({
        "name": this.category.name,
        "parent" : this.category.parent,
        "parentId" : this.category.parentId,
        "type" : this.category.type
      }).then(() => console.log('Update Successfull.'));

      // this.categoryService.updateCategory(this.activeBudget, this.category);
    }

  }

  cancel() {
    this.router.navigate(['/budgetview']);
  }

}
