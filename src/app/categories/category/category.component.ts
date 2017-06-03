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
        } else {
          if (this.childCounts[category.parent]) {
            this.childCounts[category.parent] += 1;
          } else {
            this.childCounts[category.parent] = 1;
          };
        }
      });
      this.categories = rawList;
    })
  }

  saveCategory() {
    let category = new Category();
    category.name = this.name;
    category.parent = this.parent.name;
    category.parentId = this.parent.id;
    category.balance = 0;
    category.sortingOrder = this.parent.sortingOrder + ':' + ("000" + (this.childCounts[this.parent.name] + 1)).slice(-3);

    console.log(category);
    //  this.categoryService.createCategory(this.activeBudget, category);
  }

  cancel() {
    this.router.navigate(['/budgetview']);
  }

}
