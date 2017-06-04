import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';



import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import * as firebase from 'firebase';
import * as moment from 'moment';

import { Account } from '../../shared/account';
import { BudgetService } from '../../core/budget.service';
import { UserService } from '../../shared/user.service';

@Component({
  selector: 'app-budgetview',
  templateUrl: './budgetview.component.html',
  styleUrls: ['./budgetview.component.scss']
})
export class BudgetviewComponent implements OnInit {
  categoriesAllocations: FirebaseListObservable<any>;
  categories: any[];
  allocations: FirebaseListObservable<any>;
  accounts: FirebaseListObservable<Account[]>;
  userId: string;
  activeBudget: string;

  selectedMonth: any = moment();
  nextMonth: any = moment().add(1, 'months');
  monthDisplay: Date;

  sortList: any[] = [];

  isHeader: boolean = false;

  totalIncome: number = 0;
  totalExpense: number = 0;
  totalBudgeted: number = 0;
  totalAvailable: number = 0;

  constructor(
    private db: AngularFireDatabase,
    private budgetService: BudgetService,
    private userService: UserService,
    private auth: AngularFireAuth
  ) {
    auth.authState.subscribe((user) => {
      if (!user) {
        return;
      }
      let profile = db.object('users/' + user.uid).subscribe(profile => {
        // check allocations exist
        this.checkAllocations(profile.activeBudget);
        this.loadBudget(profile.activeBudget);
        this.loadAccounts(profile.activeBudget);
        this.activeBudget = profile.activeBudget;
      });
    });
  }

  ngOnInit() {

  }

  checkIsHeader(item) {
    return item.parent == '';
  }

  checkAllocations(budgetId: string) {
    let months: string[] = [
      moment().format("YYYYMM"),
      moment().add(1, 'months').format("YYYYMM")
    ];

    months.forEach(month => {
      let ref = 'allocations/' + budgetId + '/' + month;
      let list = this.db.list(ref);

      list.take(1).subscribe(catSnapshots => {
        if (catSnapshots.length == 0) {
          // get the categories list and push new allocations to the list.
          this.db.list('categories/' + budgetId).subscribe(catSnapshots => {
            catSnapshots.forEach(catSnapshot => {
              if (!catSnapshot.type){
                catSnapshot.type = 'expense';
              }
              list.update(catSnapshot.$key, {
                planned: 0,
                actual: 0,
                balance: 0,
                name: catSnapshot.name,
                parent: catSnapshot.parent,
                sortingOrder: catSnapshot.sortingOrder,
                type: catSnapshot.type
              });
              this.db.object('categoryAllocations/' + budgetId + '/' + catSnapshot.$key + '/' + month).set(true);
            });
          });
        }
      });
    })
  }

  loadBudget(budgetId: string) {
    this.allocations = this.db.list('allocations/' + budgetId + '/' + this.selectedMonth.format("YYYYMM"), {
      query: {
        orderByChild: 'sortingOrder'
      }
    });

    this.allocations.subscribe(snp => {
      this.sortList = snp;
      this.totalExpense = 0;
      this.totalBudgeted = 0;
      this.totalIncome = 0;
      this.totalAvailable = 0;
      snp.forEach(val => {
        this.totalBudgeted += parseFloat(val.planned);
        if (val.type == "income") {
          this.totalIncome += parseFloat(val.actual);
        } else {
          this.totalExpense += parseFloat(val.actual);
        }
      });
      this.totalAvailable = this.totalIncome - this.totalBudgeted;
      if (snp.length == 0) {


      }
    })
    let start = moment().date(1);
    let end = moment();
    // console.log('moment-start', start.valueOf());
    // console.log('moment-end', end.valueOf());
    // get all the transactions for this month
    //
    /* Uncomment to run transaction sync to actual month stuffs
    let tranlist = db.list('transactions/'+budgetId);
    db.list('transactions/'+this.activeBudget.id).take(1).subscribe(tracks => {
      let running: number = 0;
      let accObj = {};
      let catObj = {};
      let allObj = {};
      tracks.forEach(track => {
        if ("expense" == track.type){
          track.amount = -Math.abs(track.amount);
        } else {
          track.amount = Math.abs(track.amount);
        }
        running += parseFloat(track.amount);
        console.log('amount', track.$key, parseFloat(track.amount));
        console.log('running', running);
        tranlist.update(track.$key, {amount: track.amount});
        // account update object

        let accRef = 'accounts/'+this.activeBudget.id+'/'+track.accountId+'/balance';
        let catRef = 'categories/'+this.activeBudget.id+'/'+track.categoryId+'/balance';
        let allRef = 'categoryAllocations/'+this.activeBudget.id+'/'+this.selectedMonth.format('YYYYMM')+'/'+track.categoryId+'/actual';
        if (!accObj[accRef]){
          accObj[accRef] = 0;
        }
        if (!catObj[catRef]){
          catObj[catRef] = 0;
        }
        if (!allObj[allRef]){
          allObj[allRef] = 0;
        }
        allObj[allRef] = allObj[allRef] + parseFloat(track.amount);
        accObj[accRef] = accObj[accRef] + parseFloat(track.amount);
        catObj[catRef] = catObj[catRef] + parseFloat(track.amount);

      });
      console.log(accObj);
      console.log(catObj);
      console.log(allObj);

      db.object('/').update(accObj);
      db.object('/').update(catObj);
      db.object('/').update(allObj);
    });
    /**/
  }

  loadAccounts(budgetId: string) {
    let accRef = 'accounts/' + budgetId;
    this.accounts = this.db.list(accRef);
  }

  alert(key) {
    console.log('key for', key);
  }

  calculateBalance(actual, planned) {
    return parseFloat(planned) + parseFloat(actual);
  }

  focus(item) {
    item.original = item.planned;
  }

  log(event) {
    let count: number = 1;
    let currentParent: any;
    let currentChildCount: number;
    this.sortList.forEach((item) => {
      if (item.parent == '') {
        currentParent = item;
        currentChildCount = 0;
      }

      if (item.parent != '') {
        if (item.sortingOrder.substr(0, 3) == currentParent.sortingOrder) {
          // increment child count
          currentChildCount++;
          let childOrder = currentParent.sortingOrder + ':' + ("000" + currentChildCount).slice(-3);

          if (childOrder != item.sortingOrder) {
            this.db.object('categories/' + this.activeBudget + '/' + item.$key).update({ 'sortingOrder': childOrder });
          }
        }
      }
    })
  }

  blur(item) {
    if (item.planned != item.original) {
      let catBalance: number = 0;
      item.balance += parseFloat(item.planned) - parseFloat(item.original);
      // update the category balance
      this.db.object('categories/' + this.activeBudget + '/' + item.$key).update({ balance: item.balance });
      // update next months previous balance
      let nextMonth = moment().add(1, 'months').format("YYYYMM");
      let nextMonthRef = 'allocations/' + this.activeBudget + '/' + nextMonth + '/' + item.$key;

      this.db.object(nextMonthRef).update({ previousBalance: item.balance });
      // update the item with the planned and balance.
      this.allocations.update(item.$key, { "planned": item.planned, "balance": item.balance });
    }
  }
}
