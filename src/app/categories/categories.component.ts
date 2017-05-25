import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

import { Category } from '../shared/category';
import { CategoryService} from '../core/category.service';
import { UserService } from '../shared/user.service';

import { BudgetService } from '../core/budget.service';

@Component({
  templateUrl: 'categories.component.html',
})

export class CategoriesComponent implements OnInit {
  userId: string;
  categories: FirebaseListObservable<any>;
  activeBudget: any;

  constructor(
    private userService: UserService,
    private budgetService: BudgetService,
    private db: AngularFireDatabase
  ) {  }

  ngOnInit() {
    this.activeBudget = this.budgetService.getActiveBudget();
    this.userId = this.userService.authUser.uid;
    this.categories = this.db.list('categories/'+this.activeBudget.id, {
      query: {
        orderByChild: 'sortingOrder'
      }
    });
  }

}
