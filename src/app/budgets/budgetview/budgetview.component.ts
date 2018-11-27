import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { DragulaService } from 'ng2-dragula';
import { Observable, of, Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import * as moment from 'moment';

import { Account } from '../../shared/account';
import { Category } from '../../shared/category';
import { Budget } from '../../shared/budget';
import { BudgetService } from '../budget.service';
import { UserService } from '../../shared/user.service';
import { CategoryService } from '../../categories/category.service';
import { AuthService } from 'app/shared/auth.service';

@Component({
  selector: 'app-budgetview',
  templateUrl: './budgetview.component.html',
  styleUrls: ['./budgetview.component.scss']
})
export class BudgetviewComponent implements OnInit, OnDestroy {
  subscriptions = new Subscription();
  categories: any[];
  userId: string;
  activeBudget: Budget;

  selectedMonth: any = moment();
  displayMonth: any;
  nextMonth: any = moment().add(1, 'months');
  prevMonth: any = moment().subtract(1, 'months');
  monthDisplay: Date;
  originalValue: number;

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
    private auth: AuthService,
    private dragulaService: DragulaService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
      this.userId = this.auth.currentUserId;
      // get active budget TODO: move to service :P
      const subscription = this.db
        .doc<any>('users/' + this.auth.currentUserId)
        .valueChanges()
        .subscribe(profile => {
          this.loadAvailableBudgets(profile);
          this.loadActiveBudget(profile.activeBudget);
        });
      this.subscriptions.add(subscription);

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
    this.route.paramMap.subscribe(params => {
      this.checkMonthParam(params.get('month'));

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
    this.subscriptions.unsubscribe();
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
  }

  /**
   * Loads the active budget from the budget service and sets the property
   * on the component
   */
  loadActiveBudget(budgetId: string): void {
    const subscription = this.budgetService.getActiveBudget$().subscribe(
      budget => {
        // set the current allocation for the selected month if there is none
        if (!budget.allocations[this.selectedMonth]) {
          budget.allocations[this.selectedMonth] = {
            income: 0,
            expense: 0
          };
        }

        this.loadCategories(budgetId);
        this.activeBudget = budget;
        this.activeBudget.id = budgetId;
      },
      error => {
        this.router.navigate(['app/budget-create']);
      }
    );
    this.subscriptions.add(subscription);
  }

  /**
   * Loads the categories to be used ond sets it as property on the component
   * @param budgetId string
   */
  loadCategories(budgetId: string): void {
    const subscription = this.categoryService.getCategories(budgetId).subscribe(list => {
      // filter list
      list = list.filter(category => category.type === 'expense');
      this.checkAllocations(list, this.selectedMonth);
      this.sortList = list;
    });
    this.subscriptions.add(subscription);
  }

  /**
   * Checks the month parameter and sets the selected month and the display month
   * on the component
   * @param monthParam string The parameter passed into the component
   */
  checkMonthParam(monthParam: string) {
    // check for null and object
    if (monthParam) {
      const month = +monthParam.substr(-2, 2);
      const year = +monthParam.substr(0, 4);

      this.selectedMonth = monthParam;
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
  }

  onBudgetActivate(id: string) {
    this.db.doc<any>('users/' + this.userId).update({ activeBudget: id });
  }

  onFreshStart() {
    this.budgetService.freshStart(this.activeBudget.id, this.userId);
  }

  onNewBudget() {
    this.router.navigate(['/app/budget-create']);
  }

  updateCategoryOrder(categories: Category[], budgetId: string): void {
    const ref = 'budgets/' + budgetId + '/categories/';
    categories.forEach(function(category, index) {
      const newOrder = ('000' + (index + 1).toString()).slice(-3);
      // check to see if it is neccessary to update the category
      if (category.sortingOrder !== newOrder) {
        category.sortingOrder = newOrder;
        this.db.doc(ref + category.id).update(category);
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

  trackCategory(index, category: Category) {
    return category ? category.id : undefined;
  }

  focus(item) {
    this.originalValue = item.allocations[this.selectedMonth].planned;
  }

  blur(item) {
    const planned: number = +item.allocations[this.selectedMonth].planned;
    const ref = 'budgets/' + this.activeBudget.id + '/categories/' + item.id,
      budgetRef = 'budgets/' + this.activeBudget.id;


    if (typeof this.originalValue !== 'undefined' && planned !== +this.originalValue) {
      if (isNaN(item.balance)) {
        item.balance = 0;
      }
      item.balance = item.balance - +this.originalValue + planned;

      // update the budget available balance
      if (isNaN(this.activeBudget.balance)) {
        this.activeBudget.balance = 0;
      }
      this.activeBudget.balance = +this.activeBudget.balance - planned + +this.originalValue;
      if (!isNaN(item.balance) && !isNaN(this.activeBudget.balance)) {
        this.categoryService.updateCategory(this.activeBudget.id, item);
        this.db.doc(budgetRef).update(this.activeBudget);
      }
    }
  }
}
