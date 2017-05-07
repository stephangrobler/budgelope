import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';

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
  budget: Budget;
  type: string;
  transaction: Transaction;
  accounts: Account[];
  categories: Category[];

  constructor(
    private userService: UserService,
    private budgetService: BudgetService,
    private transactionService: TransactionService,
    private router: Router
  ) {  }

  ngOnInit() {
    this.userId = this.userService.authUser.uid;
    this.budget = this.budgetService.getActiveBudget();
    this.getCategories();
    this.getAccounts();
  }

  getCategories(){
    let dbRef = firebase.database().ref('categories/'+this.userId);
    dbRef.once('value').then((snapshot) => {
      // make category list
      let catList = [];
      snapshot.forEach((catSnap) => {
        let catVal = catSnap.val();
        if (catVal.parent != ""){
          let category = new Category();
          category.name = catVal.name;
          category.parent = catVal.parent;
          category.id = catSnap.key;
          catList.push(category);
        }
      });
      this.categories = catList;
    });
  }

  getAccounts(){
    let dbRef = firebase.database().ref('accounts/'+this.budget.id);
    dbRef.once('value').then((snapshot) => {
      // make category list
      let accList = [];
      snapshot.forEach((accSnap) => {
        let accVal = accSnap.val();
        if (accVal.parent != ""){
          let account = new Account();
          account.title = accVal.title;
          account.id = accSnap.key;
          accList.push(account);
        }
      });
      this.accounts = accList;
    });
  }

  saveTransaction(){
    this.transaction = new Transaction();
    this.transaction.categoryId = this.category.id;
    this.transaction.category = this.category.name;
    this.transaction.accountId = this.account.id;
    this.transaction.account = this.account.title;
    this.transaction.amount = this.amount;
    this.transaction.payeeId = "MyPayee";
    this.transaction.payee = this.payee;
    this.transaction.cleared = this.cleared;
    this.transaction.type = this.type;

    console.log(this.transaction);
    this.transactionService.createTransaction(
      this.transaction,
      this.userId,
      this.budget.id
    );
    // this.transaction
  }

  cancel(){
    this.router.navigate(['/transactions']);
  }
}
