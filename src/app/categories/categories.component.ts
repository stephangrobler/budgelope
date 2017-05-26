import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';

import { Category } from '../shared/category';
import { CategoryService} from '../core/category.service';
import { UserService } from '../shared/user.service';

import { BudgetService } from '../core/budget.service';

@Component({
  templateUrl: 'categories.component.html',
})

export class CategoriesComponent implements OnInit {

  categories: FirebaseListObservable<Category[]>;
  activeBudget: string;

  constructor(
    private userService: UserService,
    private budgetService: BudgetService,
    private db: AngularFireDatabase,
    private auth: AngularFireAuth
  ) {
    auth.authState.subscribe(user => {
      if (!user){
        return;
      }
      db.object('users/'+ user.uid).subscribe(profile => {
        this.activeBudget = profile.activeBudget;
        this.categories = this.db.list('categories/'+this.activeBudget, {
          query: {
            orderByChild: 'sortingOrder'
          }
        });
        this.categories.subscribe(snap => {
          console.log(snap);
        });
      });
    })
  }

  ngOnInit() { }

}
