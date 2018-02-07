import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
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
  item: AngularFirestoreDocument<any>;
  accounts: Observable<any>;
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
    private db: AngularFirestore,
    private af: AngularFireAuth

  ) {
    this.catCtrl = new FormControl();
    this.filteredCategories = this.catCtrl.valueChanges
        .startWith(null)
        .map(category => category && typeof category === 'object' ? category.name : category)
        .map(name => name ? this.filterCategories(name) : this.categories.slice());
  }

  filterCategories(val: string){
    return val ? this.categories.filter(s => new RegExp(`^${val}`, 'gi').test(s.name + s.parent))
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
      let profile = this.db.doc<any>('users/' + user.uid).valueChanges().subscribe(profile => {
        this.activeBudget = profile.activeBudget;

        this.route.params.forEach((params: Params) => {
          this.transactionId = params["id"];
        });
        if (this.transactionId != "add") {
          this.item = this.db.doc<any>('budgets/' + profile.activeBudget + '/transactions/' + this.transactionId);
          this.item.valueChanges().subscribe(transaction => { this.transaction = transaction });
        } else {
          this.transaction = {};
        }
        // get the budget accounts
        this.accounts = this.db.collection<any>('budgets/'+ profile.activeBudget+'/accounts').valueChanges();
        this.db.collection<any>('budgets/' + profile.activeBudget + '/categories').valueChanges().subscribe(
          snap => this.categories = snap
        );
        // this.db.object('allocations/' + moment().format("YYYYMM"))
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
    let category: any = this.catCtrl.value;
    this.item.update({
      categoryId: category.$key,
      category: category.name,
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
    // console.log(this.catCtrl.value);
    this.transaction.category = this.catCtrl.value;
    this.transactionService.createTransaction(
      this.transaction,
      this.userId,
      this.activeBudget
    );
  }

  updateAccount(account: any) {
    let accItem = this.db.doc('/accounts/' + this.activeBudget + '/' + account.$key);
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
