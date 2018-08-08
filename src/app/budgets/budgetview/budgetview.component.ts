import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { DragulaService } from 'ng2-dragula';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import * as moment from 'moment';

import { Account } from '../../shared/account';
import { Category } from '../../shared/category';
import { Budget } from '../../shared/budget';
import { BudgetService } from '../budget.service';
import { UserService } from '../../shared/user.service';
import { CategoryService } from '../../categories/category.service';

@Component({
  selector: 'app-budgetview',
  templateUrl: './budgetview.component.html',
  styleUrls: ['./budgetview.component.scss']
})
export class BudgetviewComponent implements OnInit, OnDestroy {
  categories: any[];
  userId: string;
  activeBudget: Budget;

  selectedMonth: any = moment();
  displayMonth: any;
  nextMonth: any = moment().add(1, 'months');
  prevMonth: any = moment().subtract(1, 'months');
  monthDisplay: Date;

  sortList: any;

  isHeader = false;

  totalIncome = 0;
  totalExpense = 0;
  totalBudgeted = 0;
  totalAvailable = 0;

  budgetList: any[];

  constructor(
    private db: AngularFirestore,
    private budgetService: BudgetService,
    private categoryService: CategoryService,
    private userService: UserService,
    private auth: AngularFireAuth,
    private dragulaService: DragulaService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.auth.authState.subscribe(user => {
      if (!user) {
        return;
      }
      this.userId = user.uid;
      // get active budget TODO: move to service :P
      this.db
        .doc<any>('users/' + user.uid)
        .valueChanges()
        .subscribe(profile => {
          this.loadAvailableBudgets(profile);
          this.loadActiveBudget(profile.activeBudget);
        });
    });
    // drag and drop bag setup
    this.dragulaService.setOptions('order-bag', {
      moves: function(el, container, handle) {
        return handle.className.indexOf('handle') > -1;
      }
    });
    this.dragulaService.dropModel.subscribe(value => {
      this.updateCategoryOrder(this.sortList, this.activeBudget.id);
    });

    // if the month is specified, use that, else use the current month
    this.selectedMonth = this.route.paramMap.pipe(
      switchMap((params: ParamMap) => {
        return of({ month: params.get('month') });
      })
    );
    this.selectedMonth.subscribe(monthObj => {
      // check for null and object
      if (monthObj && monthObj.month) {
        const month = +monthObj.month.substr(-2, 2);
        const year = +monthObj.month.substr(0, 4);

        this.selectedMonth = monthObj.month;
        this.nextMonth = moment()
          .year(year)
          .month(month - 1)
          .add(1, 'months');
        this.prevMonth = moment()
          .year(year)
          .month(month - 1)
          .subtract(1, 'months');
        this.displayMonth = moment(this.selectedMonth + '01').format('MMMM YYYY');
      } else {
        this.selectedMonth = moment().format('YYYYMM');
        this.displayMonth = moment(this.selectedMonth + '01').format('MMMM YYYY');
      }

      if (this.sortList) {
        this.checkAllocations(this.sortList, this.selectedMonth);
      }

      if (this.activeBudget && !this.activeBudget.allocations[this.selectedMonth]) {
        this.activeBudget.allocations[this.selectedMonth] = {
          income: 0,
          expense: 0
        };
      }
    });
  }

  ngOnDestroy() {
    if (this.dragulaService.find('order-bag') !== undefined) {
      this.dragulaService.destroy('order-bag');
    }
  }

  loadAvailableBudgets(profile) {
    this.budgetList = [];
    for (const i in profile.availableBudgets) {
      if (profile.availableBudgets.hasOwnProperty(i)) {
        const budget = {
          id: i,
          name: profile.availableBudgets[i].name
        };
        this.budgetList.push(budget);
      }
    }
    console.log(this.budgetList);
  }

  loadActiveBudget(budgetId: string) {
    this.db
      .doc<Budget>('budgets/' + budgetId)
      .valueChanges()
      .subscribe(budget => {
        budget.id = budgetId;
        if (!budget.allocations[this.selectedMonth]) {
          budget.allocations[this.selectedMonth] = {
            income: 0,
            expense: 0
          };
        }
        this.loadCategories(budgetId);
        return (this.activeBudget = budget);
      });
  }

  loadCategories(budgetId: string): void {
    const reference = 'budgets/' + budgetId + '/categories';
    this.categoryService.getCategories(budgetId).subscribe(list => {
      this.checkAllocations(list, this.selectedMonth);
      this.sortList = list;
    });
  }

  onBudgetActivate(id: string) {
    this.db.doc<any>('users/' + this.userId).update({ activeBudget: id });
  }

  onFreshStart() {
    this.budgetService.freshStart(this.activeBudget.id, this.userId);
  }

  updateCategoryOrder(categories: Category[], budgetId: string): void {
    const ref = 'budgets/' + budgetId + '/categories/';
    categories.forEach(function(category, index) {
      const newOrder = ('000' + (index + 1).toString()).slice(-3);
      // check to see if it is neccessary to update the category
      if (category.sortingOrder !== newOrder) {
        category.sortingOrder = newOrder;
        this.db.doc(ref + category.id).update(category);
        console.log('updating: ', category.name);
      }
    }, this);
  }

  checkAllocations(categories: Category[], month: string) {
    categories.forEach(category => {
      if (!category.allocations) {
        category.allocations = {};
        category.allocations[month] = {
          planned: 0,
          actual: 0
        };
      } else if (category.allocations && !category.allocations[month]) {
        category.allocations[month] = {
          planned: 0,
          actual: 0
        };
      }
    });
  }

  onNextMonth() {
    this.router.navigate(['/app/budget', this.nextMonth.format('YYYYMM')]);
  }

  onPrevMonth() {
    this.router.navigate(['/app/budget', this.prevMonth.format('YYYYMM')]);
  }
  checkIsHeader(item) {
    return item.parent === '';
  }

  loadAccounts(budgetId: string) {
    const accRef = 'accounts/' + budgetId;
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

  blur(item) {
    const planned: number = item.allocations[this.selectedMonth].planned;
    const ref = 'budgets/' + this.activeBudget.id + '/categories/' + item.id,
      budgetRef = 'budgets/' + this.activeBudget.id;

    if (planned !== item.original) {
      item.balance = item.balance - item.original + planned;

      // update the budget available balance
      this.activeBudget.balance = this.activeBudget.balance - planned + item.original;

      delete item.original;
      delete item.id;

      this.db.doc(ref).update(item);
      this.db.doc(budgetRef).update(this.activeBudget);
    }
  }
}
