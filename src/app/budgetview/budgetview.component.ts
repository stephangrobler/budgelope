import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription, combineLatest, Observable, Subject } from 'rxjs';
import * as moment from 'moment';

import { Category } from '../shared/category';
import { Allocations, Budget } from '../shared/budget';
import { BudgetService } from '../budgets/budget.service';
import { UserService } from '../shared/user.service';
import { CategoryService } from '../categories/category.service';
import { AuthService } from 'app/shared/auth.service';
import { TransactionTypes } from 'app/shared/transaction';
import { map, takeUntil, tap } from 'rxjs/operators';

@Component({
  selector: 'app-budgetview',
  templateUrl: './budgetview.component.html',
  styleUrls: ['./budgetview.component.scss'],
})
export class BudgetviewComponent implements OnInit, OnDestroy {
  subscriptions = new Subscription();
  categories: Category[];
  userId: string;
  activeBudget: Budget;

  selectedMonth: any = moment();
  displayMonth: any;
  nextMonth: any = moment().add(1, 'months');
  prevMonth: any = moment().subtract(1, 'months');
  monthDisplay: Date;
  originalValue: number;
  currentCategory: Category;

  categories$: Observable<Category[]>;

  sortList: any;

  isHeader = false;

  totalIncome = 0;
  totalExpense = 0;
  totalBudgeted = 0;
  totalAvailable = 0;

  budgetList: any[];
  unsubscribe = new Subject<boolean>();
  loading$: any;
  month: Allocations = null;

  constructor(
    private budgetService: BudgetService,
    private categoryService: CategoryService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.auth.currentUser.subscribe((user) => {
      if (!user) return;
      // if the month is specified, use that, else use the current month
      this.route.paramMap.subscribe((params) => {
        this.checkMonthParam(params.get('month'));

        // get active budget TODO: move to service :P

        this.loadAvailableBudgets(user._id).subscribe((budgets) => {
          this.loadActiveBudget(user.active_budget_id);
        });

        this.categories$ = this.categoryService.entities$.pipe(
          map((categories: Category[]) => categories)
        );
        this.categories$.subscribe(
          (categories) => (this.categories = categories)
        );
        this.loading$ = this.categoryService.loading$;
      });
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadAvailableBudgets(userId) {
    this.budgetList = [];
    return this.budgetService.getWithQuery({ userId });
  }

  /**
   * Loads the active budget from the budget service and sets the property
   * on the component
   */
  loadActiveBudget(budgetId: string): void {
    this.budgetService
      .getByKey(budgetId)
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(
        (budget) => {
          this.month = budget.allocations.find(
            (month) => month.month == this.selectedMonth
          );

          if (!this.month) {
            this.month = {
              month: this.selectedMonth,
              income: 0,
              expense: 0,
              budgeted: 0,
              categories: [],
            };
            const allocations = [...budget.allocations, this.month];
            budget = {
              ...budget,
              allocations,
            };
          }
          this.month = this.loadCategories(this.month);

          this.activeBudget = { _id: budgetId, ...budget };
          // this.activeBudget.id = budgetId;
        },
        (error) => {
          // this.router.navigate(['app/budget-create']);
        }
      );
  }

  /**
   * Loads the categories to be used ond sets it as property on the component
   * @param budgetId string
   */
  loadCategories(originalMonth: Allocations): Allocations {
    const month = { ...originalMonth };
    month.categories = this.categories.map((category) => {
      const loc = month.categories.findIndex((cat) => cat._id === category._id);
      if (loc === -1) {
        return category;
      } else {
        return month.categories[loc];
      }
    });
    return month;
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
    // this.db.doc<any>('users/' + this.userId).update({ activeBudget: id });
  }

  onFreshStart() {}

  onNewBudget() {
    this.router.navigate(['/app/budget-create']);
  }

  onRecalculate() {
    console.log('recalculating...');

    const data = combineLatest([
      // this.db
      //   .collection('budgets/' + this.activeBudget.id + '/transactions')
      //   .valueChanges(),
      // this.db
      //   .collection('budgets/' + this.activeBudget.id + '/categories')
      //   .valueChanges(),
    ]);

    data.subscribe(
      (records: any[]) => {
        const transactions = records[0];
        const categories = records[1];

        const NetValue = transactions.reduce(
          (a: number, b: { amount: number }) => {
            a += Number(b.amount);
            return a;
          },
          0
        );
        const totalBudget = transactions.reduce(
          (
            a: { inc: number; exp: number },
            b: { amount: number; transfer: boolean }
          ): { inc: number; exp: number } => {
            if (b.transfer) {
              return a;
            }
            const amount = Number(b.amount);
            if (amount > 0) {
              a.inc += amount;
            } else {
              a.exp += amount;
            }
            return a;
          },
          { inc: 0, exp: 0 }
        );
        console.log(
          'TotalBudget: ',
          totalBudget,
          ' -- ',
          'Calculated Nett: ',
          NetValue
        );

        const plannedTotal: any = categories.reduce(
          (a: number, b: { allocations: any }) => {
            for (const key in b.allocations) {
              if (b.allocations.hasOwnProperty(key)) {
                const alloc = b.allocations[key];
                a += alloc.planned;
              }
            }
            return a;
          },
          0
        );
      },
      (err) => console.log('Err:', err),
      () => console.log('Completed!')
    );
  }

  updateCategoryOrder(categories: Category[], budgetId: string): void {
    const ref = 'budgets/' + budgetId + '/categories/';
    categories.forEach(function (category, index) {
      const newOrder = ('000' + (index + 1).toString()).slice(-3);
      // check to see if it is neccessary to update the category
      if (category.sortingOrder !== newOrder) {
        category.sortingOrder = newOrder;
        this.db.doc(ref + category._id).update(category);
      }
    }, this);
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
    return category ? category._id : undefined;
  }

  focus(category) {}

  update(category, $event) {
    const planned = this.updateMonthCategory(category, $event);
    this.updateBudgetCategory(category, $event, planned);
  }

  updateMonthCategory(category, $event) {
    const balance = $event - category.actual;
    const planned = category.planned;
    category = { ...category, planned: $event, balance };
    let arr = this.month.categories.slice(0);
    const index = arr.findIndex((cat) => cat._id == category._id);

    arr[index] = category;

    const monthBudgeted = arr.reduce((acc, cat) => (acc += cat.planned), 0);
    this.month = { ...this.month, budgeted: monthBudgeted, categories: arr };
    return planned;
  }

  updateBudgetCategory(category, $event, planned) {
    const budgetCategory = this.categories.find(
      (cat) => cat._id === category._id
    );
    const balance = budgetCategory.balance - planned + $event;
    this.categoryService.update({ ...budgetCategory, balance });
  }

  blur() {
    const arr = this.activeBudget.allocations.slice(0);
    const index = arr.findIndex((month) => month.month === this.month.month);
    arr[index] = this.month;
    this.activeBudget = { ...this.activeBudget, allocations: arr };

    this.budgetService.update(this.activeBudget);
  }
}
