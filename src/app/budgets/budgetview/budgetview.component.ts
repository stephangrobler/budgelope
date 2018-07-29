import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router, ActivatedRoute, ParamMap, Params } from '@angular/router';

import { DragulaService } from 'ng2-dragula';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/switchMap';

import * as moment from 'moment';

import { Account } from '../../shared/account';
import { Category } from '../../shared/category';
import { Budget } from '../../shared/budget';
import { BudgetService } from '../budget.service';
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
  displayMonth: any;
  nextMonth: any = moment().add(1, 'months');
  prevMonth: any = moment().subtract(1, 'months');
  monthDisplay: Date;

  sortList: any;

  isHeader: boolean = false;

  totalIncome: number = 0;
  totalExpense: number = 0;
  totalBudgeted: number = 0;
  totalAvailable: number = 0;

  budgetList: any[];

  constructor(
    private db: AngularFirestore,
    private budgetService: BudgetService,
    private userService: UserService,
    private auth: AngularFireAuth,
    private dragulaService: DragulaService,
    private route: ActivatedRoute,
    private router: Router
  ) {

  }

  ngOnInit() {
    this.auth.authState.subscribe((user) => {
      if (!user) {
        return;
      }
      this.userId = user.uid;

      console.log('users/', user.uid);
      // get active budget TODO: move to service :P
      this.db.doc<any>('users/' + user.uid).valueChanges().subscribe(profile => {
        this.budgetList = [];
        console.log('budgets/' + profile.activeBudget);
        for (let i in profile.availableBudgets) {
          let budget = {
            id: i,
            name: profile.availableBudgets[i].name
          };
          this.budgetList.push(budget);
        }

        this.db.doc<Budget>('budgets/' + profile.activeBudget).valueChanges().subscribe(budget => {
          budget.id = profile.activeBudget;
          console.log('budget', budget);
          if (!budget.allocations[this.selectedMonth]) {
            budget.allocations[this.selectedMonth] = {
              "income": 0,
              "expense": 0
            };
          }
          this.getCategories(profile.activeBudget);
          return this.activeBudget = budget;
        });
      });
    });
    console.log('test3');
    // drag and drop bag setup
    this.dragulaService.setOptions('order-bag', {
      moves: function(el, container, handle) {
        return handle.className.indexOf('handle') > -1;
      }
    });
    this.dragulaService.dropModel.subscribe((value) => {
      this.updateCategoryOrder(this.sortList, this.activeBudget.id);
    });
    console.log('test5');
    // if the month is specified, use that, else use the current month
    this.route.params.subscribe((params: Params) => {
      let month = +params['month'].substr(-2, 2);
      let year = +params['month'].substr(0, 4);

      if (params['month']) {
        this.selectedMonth = params['month'];
        this.nextMonth = moment().year(year).month(month - 1).add(1, 'months');
        this.prevMonth = moment().year(year).month(month - 1).subtract(1, 'months');
        this.displayMonth = moment(this.selectedMonth + '01').format('MMMM YYYY');
      } else {
        this.selectedMonth = moment().format("YYYYMM");
        this.displayMonth = moment(this.selectedMonth + '01').format('MMMM YYYY');
      }

      if (this.sortList) {
        this.checkAllocations(this.sortList, this.selectedMonth);
      }

      if (this.activeBudget && !this.activeBudget.allocations[this.selectedMonth]) {
        this.activeBudget.allocations[this.selectedMonth] = {
          "income": 0,
          "expense": 0
        };
      }
    })
  }

  ngOnDestroy() {
    if (this.dragulaService.find('order-bag') !== undefined) {
      this.dragulaService.destroy('order-bag');
    }
  }

  onBudgetActivate(id : string){
    this.db.doc<any>('users/' + this.userId).update({activeBudget: id});
  }

  onFreshStart(){
    this.budgetService.freshStart(this.activeBudget.id, this.userId);
  }

  updateCategoryOrder(categories: Category[], budgetId: string): void {
    let ref = 'budgets/' + budgetId + '/categories/';
    categories.forEach(function(category, index) {
      let newOrder = ('000' + (index + 1).toString()).slice(-3);
      // check to see if it is neccessary to update the category
      if (category.sortingOrder != newOrder) {
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

  getCategories(budgetId: string): void {
    let ref = 'budgets/' + budgetId + '/categories';
    console.log('test4');
    let testList = this.db.collection<Category[]>(ref, ref => ref.orderBy('sortingOrder')).snapshotChanges().map(budget => {
      let budgetList: any = budget.map(b => {
        let thisRef = ref + '/' + b.payload.doc.id + '/categories';
        const data = b.payload.doc.data() as Category;
        const catRef = this.db.collection<Category>(thisRef).snapshotChanges();
        const id = b.payload.doc.id;
        return { id, ...data }
      });

      return budgetList;
    });

    testList.subscribe(list => {
      this.checkAllocations(list, this.selectedMonth);
      this.sortList = list;
    });
  }

  onNextMonth() {
    this.router.navigate(['/app/budget', this.nextMonth.format('YYYYMM')]);
  }

  onPrevMonth() {
    this.router.navigate(['/app/budget', this.prevMonth.format('YYYYMM')]);

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
