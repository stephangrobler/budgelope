import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AngularFireDatabase, FirebaseObjectObservable, FirebaseListObservable } from 'angularfire2/database';

import { Transaction } from '../../shared/transaction';
import { Account } from '../../shared/account';
import { Budget } from '../../shared/budget';
import { Category } from '../../shared/category';
import { BudgetService } from '../../core/budget.service';
import { UserService } from '../../shared/user.service';
import { TransactionService } from '../../core/transaction.service';


@Component({
  templateUrl: 'transaction.component.html',
})
export class TransactionComponent implements OnInit {
  payeeId: string;
  payee: string;
  cleared: boolean = false;
  account: Account;
  category: Category;
  userId: string;
  amount: number;
  activeBudget: Budget;
  type: string;
  transactionId: string;
  item: FirebaseObjectObservable<any>;
  accounts: FirebaseListObservable<any>;
  categories: FirebaseListObservable<any>;
  transaction: any;

  constructor(
    private userService: UserService,
    private budgetService: BudgetService,
    private transactionService: TransactionService,
    private router: Router,
    private route: ActivatedRoute,
    private db: AngularFireDatabase

  ) { }

  ngOnInit() {
    this.userId = this.userService.authUser.uid;
    this.activeBudget = this.budgetService.getActiveBudget();
    this.route.params.forEach((params: Params) => {
      this.transactionId = params["id"];
    });
    if (this.transactionId != "add") {
      this.item = this.db.object('transactions/' + this.userId + '/' + this.activeBudget.id + '/' + this.transactionId);
      this.item.subscribe(transaction => { this.transaction = transaction });
    } else {
      this.transaction = {};
    }
    console.log(this.transaction);
    // get the budget accounts
    this.accounts = this.db.list('accounts/' + this.activeBudget.id);
    this.categories = this.db.list('categories/' + this.userId);
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
    let items = this.db.list('transactions/' + this.userId + '/' + this.activeBudget.id);
    items.push({
      categoryId: this.transaction.category.$key,
      category: this.transaction.category.name,
      accountId: this.transaction.account.$key,
      account: this.transaction.account.name,
      amount: this.transaction.amount,
      type: this.transaction.type,
      payee: this.transaction.payee
    }).then(response => {
      alert('transaction created successfull');
      this.updateAccount(this.transaction.account);
    }).catch(error => {
      alert('there was an error creating the transaction.');
      console.log('ERROR:', error);
    });
  }

  updateAccount(account: any){
    let accItem = this.db.object('/accounts/'+this.activeBudget.id + '/' + account.$key);
    let balance = account.balance;
    if (this.transaction.type == 'expense'){
      balance -= parseFloat(this.transaction.amount);
    } else if (this.transaction.type == 'income'){
      balance += parseFloat(this.transaction.amount);
    }
    accItem.update({ "balance": balance}).then(response => {
      alert('account updated from ' + account.balance + ' to ' + balance);
    })
  }

  cancel() {
    this.router.navigate(['/transactions']);
  }
}
