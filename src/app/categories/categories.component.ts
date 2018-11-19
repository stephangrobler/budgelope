import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import * as moment from 'moment';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

import { Category } from '../shared/category';
import { CategoryService } from './category.service';
import { UserService } from '../shared/user.service';

import { BudgetService } from '../budgets/budget.service';

@Component({
  templateUrl: 'categories.component.html'
})
export class CategoriesComponent implements OnInit {
  categories: AngularFirestoreCollection<Category[]>;
  activeBudget: string;

  constructor(
    private userService: UserService,
    private budgetService: BudgetService,
    private db: AngularFirestore,
    private auth: AngularFireAuth
  ) {
    auth.authState.subscribe(user => {
      if (!user) {
        return;
      }
      db.doc<any>('users/' + user.uid)
        .valueChanges()
        .subscribe(profile => {
          this.activeBudget = profile.activeBudget;

          this.categories = this.db.collection<Category[]>(
            'budgets/' + this.activeBudget + '/categories'
          );

          console.log(this.categories);
        });
    });
  }

  ngOnInit() {}
}
