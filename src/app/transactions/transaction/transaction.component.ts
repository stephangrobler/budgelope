import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2/database';
import * as moment from 'moment';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';

import { Transaction } from '../../shared/transaction';
import { Account } from '../../shared/account';
import { Budget } from '../../shared/budget';
import { Category } from '../../shared/category';
import { BudgetService } from '../../core/budget.service';
import { UserService } from '../../shared/user.service';
import { TransactionService } from '../../core/transaction.service';


@Component({
  templateUrl: 'transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {
  payeeId: string;
  payee: string;
  cleared: boolean = false;
  account: Account;
  category: Category;
  userId: string;
  amount: number;
  activeBudget: string;
  type: string;
  transactionId: string;
  item: FirebaseObjectObservable<any>;
  accounts: FirebaseListObservable<any>;
  categories: any[] = [];
  transaction: any;

  catCtrl: FormControl;
  filteredCategories: any;

  constructor(
    private userService: UserService,
    private budgetService: BudgetService,
    private transactionService: TransactionService,
    private router: Router,
    private route: ActivatedRoute,
    private db: AngularFireDatabase,
    private af: AngularFireAuth

  ) {
    this.catCtrl = new FormControl();
    this.filteredCategories = this.catCtrl.valueChanges
        .startWith(null)
        .map(category => category && typeof category === 'object' ? category.name : category)
        .map(name => name ? this.filterCategories(name) : this.categories.slice());
  }

  filterCategories(val: string){
    return val ? this.categories.filter(s => new RegExp(`^${val}`, 'gi').test(s.name))
               : this.categories;
  }

  displayFn(category: any): string {
    return category ? ' ' + category.parent + ' > ' + category.name  : category;
  }

  ngOnInit() {
    this.af.authState.subscribe((user) => {
      if (!user) {
        return;
      }
      let profile = this.db.object('users/' + user.uid).subscribe(profile => {
        this.activeBudget = profile.activeBudget;

        this.route.params.forEach((params: Params) => {
          this.transactionId = params["id"];
        });
        if (this.transactionId != "add") {
          this.item = this.db.object('transactions/' + profile.activeBudget + '/' + this.transactionId);
          this.item.subscribe(transaction => { this.transaction = transaction });
        } else {
          this.transaction = {};
        }
        // get the budget accounts
        this.accounts = this.db.list('accounts/' + profile.activeBudget);
        this.db.list('categories/' + profile.activeBudget).subscribe(snap => this.categories = snap);
        this.db.object('allocations/' + moment().format("YYYYMM"))
      });
    });


  }

  saveTransaction() {
    if (this.transactionId == 'add') {
      this.create();
    } else {
      this.update();
    }
  }

  update() {
    let account: any = this.transaction.account;
    this.item.update({
      categoryId: this.transaction.category.$key,
      category: this.transaction.category.name,
      accountId: this.transaction.account.$key,
      account: this.transaction.account.name,
      amount: this.transaction.amount,
      type: this.transaction.type,
      payee: this.transaction.payee
    }).then(response => {
      alert('transaction update successfull');
      this.updateAccount(account);
    }).catch(error => {
      alert('there was an error updating the transaction.');
      console.log('ERROR:', error);
    });
  }

  create() {
    console.log(this.catCtrl.value);
    //
    // this.transactionService.createTransaction(
    //   this.transaction,
    //   this.userId,
    //   this.activeBudget
    // );
  }

  updateAccount(account: any) {
    let accItem = this.db.object('/accounts/' + this.activeBudget + '/' + account.$key);
    let balance = account.balance;
    if (this.transaction.type == 'expense') {
      balance -= parseFloat(this.transaction.amount);
    } else if (this.transaction.type == 'income') {
      balance += parseFloat(this.transaction.amount);
    }
    accItem.update({ "balance": balance }).then(response => {
      alert('account updated from ' + account.balance + ' to ' + balance);
    })
  }

  cancel() {
    this.router.navigate(['/transactions']);
  }
}
