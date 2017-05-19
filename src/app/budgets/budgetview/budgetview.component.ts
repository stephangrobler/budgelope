import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable, FirebaseObjectObservable } from 'angularfire2/database';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import * as firebase from 'firebase';
import * as moment from 'moment';

import { BudgetService } from '../../core/budget.service';
import { UserService } from '../../shared/user.service';

@Component({
  selector: 'app-budgetview',
  templateUrl: './budgetview.component.html',
  styleUrls: ['./budgetview.component.css']
})
export class BudgetviewComponent implements OnInit {
  categoriesAllocations: FirebaseListObservable<any>;
  categories: any[];
  allocations: FirebaseListObservable<any>;
  userId: string;
  activeBudget: any;
  selectedMonth: any = moment();
  monthDisplay: Date;

  totalIncome: number = 0;
  totalExpense: number = 0;
  totalBudgeted: number = 0;
  totalAvailable: number = 0;

  constructor(
    private db: AngularFireDatabase,
    private budgetService: BudgetService,
    private userService: UserService
  ) {
    // this.activeBudget = this.budgetService.getActiveBudget();
    // this.userId = this.userService.authUser.uid;

    this.activeBudget = { id: '-Kj4WoSIBP26dbPlEwj5' };
    this.userId = '';
    this.allocations = db.list('categoryAllocations/' + this.activeBudget.id + '/' + this.selectedMonth.format("YYYYMM"));
    this.allocations.subscribe(snp => {
      this.totalExpense = 0;
      this.totalBudgeted = 0;
      this.totalIncome = 0;
      this.totalAvailable = 0;
      snp.forEach(val => {
        this.totalBudgeted += parseFloat(val.planned);
        if (val.type == "income"){
          this.totalIncome += parseFloat(val.actual);
        } else {
          this.totalExpense += parseFloat(val.actual);
        }
      });
      this.totalAvailable = this.totalIncome - this.totalBudgeted;
      if (snp.length == 0){
        console.log('creating new allocations records for ' + this.selectedMonth);
        // get the categories list and push new allocations to the list.
        db.list('categories/'+this.activeBudget.id).subscribe(catSnapshots => {
          catSnapshots.forEach(catSnapshot => {
            this.allocations.update(catSnapshot.$key, {
              planned: 0,
              actual: 0,
              balance: 0,
              name: catSnapshot.name
            });
          });
        });
      }
    })
    let start = moment().date(1);
    let end = moment();
    console.log('moment-start', start.valueOf());
    console.log('moment-end', end.valueOf());
    // get all the transactions for this month
    //
    /* Uncomment to run transaction sync to actual month stuffs
    let tranlist = db.list('transactions/'+this.activeBudget.id);
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

  ngOnInit() {

  }

  alert(key) {
    console.log('key for', key);
  }

  calculateBalance(actual, planned){
    return parseFloat(planned) + parseFloat(actual);
  }

  focus(item) {
    item.original = item.planned;
  }

  blur(item) {
    if (item.planned != item.original) {
      let catBalance: number = 0;
      item.balance += parseFloat(item.planned) - parseFloat(item.original);
      this.db.object('categories/'+this.activeBudget.id+'/'+item.$key).update({balance: item.balance});
      this.allocations.update(item.$key, { "planned": item.planned, "balance": item.balance });
    }
  }
}
