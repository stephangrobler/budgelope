import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

import * as firebase from 'firebase';

import { Category } from '../../shared/category';
import { CategoryService } from '../../core/category.service';
import { UserService } from '../../shared/user.service';

@Component({
  templateUrl: 'category.component.html',
})
export class CategoryComponent implements OnInit {
  name: string;
  parent: Category;
  categories: Category[];
  childCounts: any;
  theUserId: string;
  activeBudget: string;

  constructor(
    private router: Router,
    private categoryService: CategoryService,
    private userService: UserService,
    private auth: AngularFireAuth,
    private db: AngularFireDatabase
  ) { }

  ngOnInit() {
    this.auth.authState.subscribe(user => {
      if (!user){
        return;
      }
      this.db.object('users/' + user.uid).subscribe(profile => {
        this.activeBudget = profile.activeBudget;
        this.db.list('categories/'+this.activeBudget).subscribe(catSnap => {
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
              if (this.childCounts[category.parent]){
                this.childCounts[category.parent] += 1;
              } else {
                this.childCounts[category.parent] = 1;
              };
            }
          });
          console.log(rawList, this.childCounts);
          this.categories = rawList;
        })
      });
    });
  }

  saveCategory() {
    let category = new Category();
    category.name = this.name;
    category.parent = this.parent.name;
    category.parentId = this.parent.id;
    category.balance = 0;
    category.sortingOrder = this.parent.sortingOrder + ':' + ("000" + (this.childCounts[this.parent.name] + 1)).slice(-3);

    console.log(category);
   this.categoryService.createCategory(this.activeBudget, category);
  }

  cancel() {
    this.router.navigate(['/categories']);
  }

}
