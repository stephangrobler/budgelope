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
        console.log(this.categories);
        this.categories.subscribe(snap => {
          let allocations = db.list('categoryAllocations/'+this.activeBudget);
          allocations.take(1).subscribe((alloc)=>{
            // console.log(alloc.$key);
            // loop through the categories
            snap.forEach(cat => {
              // update each allocation in the allocations list, this should happen only on
              // category creation
              alloc.forEach(allocation => {
                let ref: string = allocation.$key + '/' + cat.$key;
                let actual: number = allocation[cat.$key].actual;
                let planned: number = allocation[cat.$key].planned;

                if (!allocation[cat.$key].actual){
                  actual = 0;
                }
                if (!allocation[cat.$key].planned){
                  planned = 0;
                }
                // allocations.update(ref, {name: cat.name, sortingOrder: cat.sortingOrder, balance: cat.balance, actual: actual, planned: planned});
              });
            });
          });
        });
      });
    })
  }

  ngOnInit() { }

}
