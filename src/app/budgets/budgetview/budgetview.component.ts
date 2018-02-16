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
      this.activeBudget = budgetService.getActiveBudget();

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

  checkAllocations(budgetId: string) {
    let months: string[] = [
      moment().format("YYYYMM"),
      moment().add(1, 'months').format("YYYYMM")
    ];

    months.forEach(month => {
      let ref = '/budgets/pPkN7QxRdyyvG4Jy2hr6/categories/BlpH88FtFbxuMzh99EYA';
      let list = this.db.collection(ref).valueChanges();

      list.take(1).subscribe(catSnapshots => {
        console.log(catSnapshots);
        if (catSnapshots.length == 0) {
          // get the categories list and push new allocations to the list.
          // this.db.list<any>('categories/' + budgetId).valueChanges().subscribe(catSnapshots => {
          //   catSnapshots.forEach(catSnapshot => {
          //     if (!catSnapshot.type){
          //       catSnapshot.type = 'expense';
          //     }
          //     /*
          //     list.update(catSnapshot.$key, {
          //       planned: 0,
          //       actual: 0,
          //       balance: 0,
          //       name: catSnapshot.name,
          //       parent: catSnapshot.parent,
          //       sortingOrder: catSnapshot.sortingOrder,
          //       type: catSnapshot.type
          //     });
          //     this.db.object('categoryAllocations/' + budgetId + '/' + catSnapshot.$key + '/' + month).set(true);
          //     */
          //   });
          // });
        }
      });
    })
  }

  loadBudget(budgetId: string) {
    /*
    this.allocations = this.db.list<any>('allocations/' + budgetId + '/' + this.selectedMonth.format("YYYYMM"), {
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
    let planned : number = item.allocations[this.selectedMonth].planned;
    let ref = 'budgets/' + this.activeBudget + '/categories/' + item.id;

    if (planned != item.original) {
      item.balance = (item.balance - item.original) + planned;

      delete(item.original);
      delete(item.id);

      this.db.doc(ref).update(item);
    }
  }
}
