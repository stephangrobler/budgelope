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
import dayjs, { Dayjs } from 'dayjs';

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

  selectedMonth: string = '';
  displayMonth: any;
  nextMonth: Dayjs = dayjs().add(1, 'months');
  prevMonth: Dayjs = dayjs().subtract(1, 'months');
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
      // get active budget TODO: move to service :P

      this.loadAvailableBudgets(user._id).subscribe((budgets) => {
        if (!this.activeBudget) {
          this.loadActiveBudget(user.active_budget_id).subscribe(
            (budget) => {
              this.activeBudget = budget;
              this.month = this.loadMonthAllocation(this.selectedMonth, this.activeBudget);
            }
          );
        }
      });
      this.categories$ = this.categoryService.entities$.pipe(
        map((categories: Category[]) => categories)
      );
      this.categories$.subscribe(
        (categories) => (this.categories = categories)
      );
      this.loading$ = this.categoryService.loading$;
      // if the month is specified, use that, else use the current month
      this.route.paramMap.subscribe((params) => {
        this.checkMonthParam(params.get('month'));
        if (this.activeBudget) {
          this.month = this.loadMonthAllocation(params.get('month'), this.activeBudget);
          this.addMonth(this.month);
        }
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

  addMonth(month: Allocations): void {
    const hasMonth = this.activeBudget.allocations.find(allocation => allocation.month === month.month);
    if (!hasMonth){
      const allocations = [...this.activeBudget.allocations, month];
      this.activeBudget = {...this.activeBudget, allocations};
    }
  }

  /**
   * Loads the active budget from the budget service and sets the property
   * on the component
   */
  loadActiveBudget(budgetId: string): Observable<Budget> {
    return this.budgetService.getByKey(budgetId).pipe(
      map((budget) => {
        return this.makeBudgetToUse(budget, budgetId);
      }),
      takeUntil(this.unsubscribe)
    );
  }

  loadMonthAllocation(monthParam: string, budget: Budget) {
    const previousMonth = budget.allocations.find(
      (allocation) => allocation.month === this.prevMonth.format('YYYYMM')
    );
    let currentMonth = budget.allocations.find(
      (month) => month.month == monthParam
    );
    if (!currentMonth) {
      currentMonth = {
        month: monthParam,
        income: 0,
        expense: 0,
        budgeted: 0,
        categories: [],
      };
    }
    currentMonth = this.loadCategories(currentMonth, previousMonth);
    return currentMonth;
  }

  makeBudgetToUse(budget: Budget, budgetId: string) {
    const allocation = this.loadMonthAllocation(this.selectedMonth, budget);
    const allocations = [...budget.allocations, allocation];
    return { _id: budgetId, ...budget, allocations };
  }

  /**
   * Loads the categories to be used ond sets it as property on the component
   * @param budgetId string
   */
  loadCategories(
    originalMonth: Allocations,
    previousMonth: Allocations
  ): Allocations {
    const month = { ...originalMonth };

    month.categories = this.categories
      .filter((category) => category.type !== 'income')
      .map((category) => {
        const currentAllocationIndex = month.categories.findIndex(
          (cat) => cat._id === category._id
        );
        let previousMonthCategoryName = '';
        let previousMonthCategoryBalance = 0;
        if (previousMonth) {
          const previousMonthCategory = previousMonth.categories.find(
            (cat) => cat._id === category._id
          );
          previousMonthCategoryBalance = previousMonthCategory.balance;
        }
        category = {...category, balance: 0, actual: 0, planned:0};
        const returnCategory =
          currentAllocationIndex === -1
            ? category
            : month.categories[currentAllocationIndex];

        let balance = 0;
        
        if (previousMonthCategoryBalance > 0 || previousMonth) {
          balance =
            returnCategory.planned -
            returnCategory.actual +
            previousMonthCategoryBalance;
        } else {
          balance = returnCategory.planned - returnCategory.actual;
        }

        return { ...returnCategory, name: category.name, balance };
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

      this.selectedMonth = dayjs(monthParam).format('YYYYMM');
      this.nextMonth = dayjs()
        .year(year)
        .month(month - 1)
        .add(1, 'months');
      this.prevMonth = dayjs()
        .year(year)
        .month(month - 1)
        .subtract(1, 'months');
      this.displayMonth = dayjs(this.selectedMonth + '01').format('MMMM YYYY');
    } else {
      this.selectedMonth = dayjs().format('YYYYMM');
      this.displayMonth = dayjs(this.selectedMonth + '01').format('MMMM YYYY');
    }
  }

  onBudgetActivate(id: string) {
    // this.db.doc<any>('users/' + this.userId).update({ activeBudget: id });
  }

  onFreshStart() {

  }

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
    let categoryArray = this.month.categories.slice(0); // immutable - copy array
    const categoryIndex = categoryArray.findIndex((cat) => cat._id == category._id);

    categoryArray[categoryIndex] = category;

    const monthBudgeted = categoryArray.reduce((acc, cat) => (acc += cat.planned), 0);
    this.month = {
      ...this.month,
      budgeted: monthBudgeted,
      categories: categoryArray,
    };
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
