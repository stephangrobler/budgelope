import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';

import * as moment from 'moment';

import { Account } from '../../shared/account';
import { Category } from '../../shared/category';
import { Budget } from '../../shared/budget';
import { BudgetService } from '../../core/budget.service';
import { UserService } from '../../shared/user.service';


@Component({
  selector: 'app-budgetview',
  templateUrl: './budgetview.component.html',
  styleUrls: ['./budgetview.component.scss']
})
export class BudgetviewComponent implements OnInit {
  categoriesAllocations: AngularFireList<any>;
  categories: any[];
  allocations: AngularFireList<any>;
  accounts: AngularFireList<Account[]>;
  userId: string;
  activeBudget: Budget;

  selectedMonth: any = moment();
  nextMonth: any = moment().add(1, 'months');
  monthDisplay: Date;

  sortList: any;

  isHeader: boolean = false;

  totalIncome: number = 0;
  totalExpense: number = 0;
  totalBudgeted: number = 0;
  totalAvailable: number = 0;

  constructor(
    private db: AngularFirestore,
    private budgetService: BudgetService,
    private userService: UserService,
    private auth: AngularFireAuth
  ) {
    this.selectedMonth = moment().format("YYYYMM");

    auth.authState.subscribe((user) => {
      if (!user) {
        return;
      }
      // get active budget TODO: move to service :P
      let profile = db.doc<any>('users/' + user.uid).valueChanges().subscribe(profile => {
        db.doc<Budget>('budgets/' + profile.activeBudget).valueChanges().subscribe(budget => {
          budget.id = profile.activeBudget;

          return this.activeBudget = budget;
        });
      });

      let ref = 'budgets/pPkN7QxRdyyvG4Jy2hr6/categories';
      let testList = db.collection<Category[]>(ref).snapshotChanges().map(budget => {
        let budgetList: any = budget.map(b => {
          let thisRef = ref + '/' + b.payload.doc.id + '/categories';

          const data = b.payload.doc.data() as Category;
          const catRef = db.collection<Category>(thisRef).snapshotChanges();

          const id = b.payload.doc.id;

          // ensure there are allocations for the current month and add if not
          if (!data.allocations) {
            data.allocations = {};
            data.allocations[this.selectedMonth] = {
              planned: 0,
              actual: 0
            };
          } else if (data.allocations && !data.allocations[this.selectedMonth]) {
            data.allocations[this.selectedMonth] = {
              planned: 0,
              actual: 0
            };
          }

          return { id, ...data }
        });

        return budgetList;
      });

      testList.subscribe(list => {
        this.sortList = list;
      });

    });

  }

  ngOnInit() {

  }

  checkIsHeader(item) {
    return item.parent == '';
  }

  loadAccounts(budgetId: string) {
    let accRef = 'accounts/' + budgetId;
    // this.accounts = this.db.list(accRef);
  }

  alert(key) {
    console.log('key for', key);
  }

  calculateBalance(actual, planned) {
    return parseFloat(planned) + parseFloat(actual);
  }

  focus(item) {
    item.original = item.allocations[this.selectedMonth].planned;
  }

  log(event) {
    let count: number = 1;
    let currentParent: any;
    let currentChildCount: number;
    // this.sortList.forEach((item) => {
    //   if (item.parent == '') {
    //     currentParent = item;
    //     currentChildCount = 0;
    //   }
    //
    //   if (item.parent != '') {
    //     if (item.sortingOrder.substr(0, 3) == currentParent.sortingOrder) {
    //       // increment child count
    //       currentChildCount++;
    //       let childOrder = currentParent.sortingOrder + ':' + ("000" + currentChildCount).slice(-3);
    //
    //       if (childOrder != item.sortingOrder) {
    //         // this.db.object('categories/' + this.activeBudget + '/' + item.$key).update({ 'sortingOrder': childOrder });
    //       }
    //     }
    //   }
    // })
  }

  blur(item) {
    let planned: number = item.allocations[this.selectedMonth].planned;
    let ref = 'budgets/' + this.activeBudget.id + '/categories/' + item.id,
      budgetRef = 'budgets/' + this.activeBudget.id;

    if (planned != item.original) {
      item.balance = (item.balance - item.original) + planned;

      // update the budget available balance
      this.activeBudget.balance = (this.activeBudget.balance - planned) + item.original;

      delete (item.original);
      delete (item.id);

      this.db.doc(ref).update(item);
      this.db.doc(budgetRef).update(this.activeBudget);
    }
  }
}
