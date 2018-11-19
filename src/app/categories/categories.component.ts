import { Component, OnInit } from '@angular/core';
import * as firebase from 'firebase';
import * as moment from 'moment';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

import { Category } from '../shared/category';
import { CategoryService} from './category.service';
import { UserService } from '../shared/user.service';

import { BudgetService } from '../budgets/budget.service';

@Component({
  templateUrl: 'categories.component.html',
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
      db.doc<any>('users/' + user.uid).valueChanges().subscribe(profile => {
        this.activeBudget = profile.activeBudget;

        this.categories = this.db.collection<Category[]>('budgets/' + this.activeBudget + '/categories');

        console.log(this.categories);

        // this.categories.valueChanges().subscribe(snap => {
          // let allocations = db.c<Category>('categoryAllocations/' + this.activeBudget);
          // allocations.valueChanges().take(1).subscribe((alloc) => {
            // console.log(alloc.$key);
            // loop through the categories
            // snap.forEach(cat => {
              // update each allocation in the allocations list, this should happen only on
              // category creation
              /*
              alloc.forEach(allocation => {
                let ref: string = allocation.$key + '/' + cat.$key;
                let actual: number = allocation[cat.$key].actual;
                let planned: number = allocation[cat.$key].planned;

                if (!allocation[cat.$key].actual) {
                  actual = 0;
                }
                if (!allocation[cat.$key].planned) {
                  planned = 0;
                }
                // allocations.update(ref, {name: cat.name, sortingOrder: cat.sortingOrder, balance: cat.balance, actual: actual, planned: planned});
              });
              */
              /*
              //create array of nested allocations
              let time: any = moment();
              let allocat: any = {
                "planned":500,
                "actual":500,
                "previousBalance": 500
              }
              cat.allocations = {};
              for (let i = 0; i < 60; i++) {
                  cat.allocations[time.format("YYYYMM")] = allocat;
                  time.add(1, 'months');
              }


*/
            // });
            /*
            // console.log('allocations on cat', JSON.stringify(snap));
            let stime: any = moment();
            // console.log(alloc);
            let all: any = alloc[1];
            let all10: any = {};
            for (let i = 0; i < 60; i++) {
                all10[stime.format("YYYYMM")] = all;
                stime.add(1, 'months');
            }
            // console.log('sep alloc for cats', JSON.stringify(all10));
            */
          // });
        // });
      });
    })
  }

  ngOnInit() { }

}
