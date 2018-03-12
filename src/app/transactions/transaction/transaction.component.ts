import { Component, OnInit, OnChanges, Input, SimpleChange } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, AngularFireList, AngularFireObject } from 'angularfire2/database';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';

import { MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs/Observable';
import * as moment from 'moment';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';

import { Profile } from '../../shared/profile';
import { Transaction } from '../../shared/transaction';
import { Account } from '../../shared/account';
import { Budget } from '../../shared/budget';
import { Payee } from '../../shared/payee';
import { Category, CategoryId } from '../../shared/category';
import { BudgetService } from '../../core/budget.service';
import { UserService } from '../../core/user.service';
import { TransactionService } from '../../core/transaction.service';
import { AccountService } from '../../core/account.service';
import { CategoryService } from '../../core/category.service';


@Component({
  selector: 'app-transaction',
  templateUrl: 'transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {

  @Input() transaction: Transaction;

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
  item: AngularFirestoreDocument<any>;
  accounts: Account[];
  categories: CategoryId[];
  newTransaction: Transaction;
  transactionCategories: any;
  selectedAccount: Account;

  catCtrl: FormControl;
  filteredCategories: any;

  constructor(
    private userService: UserService,
    private budgetService: BudgetService,
    private transactionService: TransactionService,
    private accountService: AccountService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    private db: AngularFirestore,
    private af: AngularFireAuth,
    public snackBar: MatSnackBar

  ) {

    this.newTransaction = new Transaction({
      date: new Date()
    });
    this.catCtrl = new FormControl();
    this.filteredCategories = this.catCtrl.valueChanges
      .startWith(null)
      .map(category => {
        return category && typeof category === 'object' ? category.name : category;
      })
      .map(name => {
        return name ? this.filterCategories(name) : this.categories;
      });
  }

  filterCategories(val: string): Category[] {
    return val ? this.categories.filter(s => {
      return new RegExp(`^${val}`, 'gi').test(s.name + s.parent);
    }) : this.categories;
  }

  displayFn(category: any): string {
    return category ? ' ' + category.parent + ' > ' + category.name : category;
  }

  ngOnInit() {
    this.userService.getProfile$().subscribe(profile => {
      this.budgetService.getActiveBudget$().subscribe(budget => {
        this.activeBudget = budget;
      });

      this.route.params.forEach((params: Params) => {
        this.transactionId = params["id"];
      });
      if (this.transactionId != "add") {
        this.item = this.db.doc<any>('budgets/' + profile.activeBudget + '/transactions/' + this.transactionId);
        this.item.valueChanges().subscribe(transaction => { this.transaction = transaction });
      } else {
        this.transaction = new Transaction();
      }
      // get the budget accounts
      this.accountService.getAccounts(profile.activeBudget).subscribe(accounts => this.accounts = accounts);

      this.categoryService.getCategories(profile.activeBudget).subscribe(categories => {
        this.categories = categories;
      });

      this.transactionCategories = [
        {
          category: "",
          in: 0,
          out: 0
        }
      ];
    });
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if (changes.transaction.currentValue) {
      this.newTransaction = changes.transaction.currentValue;
      this.category = this.categories.filter(item => {
        return item.id == this.newTransaction.categoryId;
      })[0];
      this.catCtrl.setValue(this.category);
      this.selectedAccount = this.accounts.filter(account => {
        return account.id == this.newTransaction.accountId;
      })[0];
    }
  }

  addCategory(){
    // take current category as main
    this.transactionCategories.push({
      category: "",
      in: 0,
      out: 0
    });
  }

  saveTransaction() {
    if (this.newTransaction.id != null) {
      console.log('updating ', this.newTransaction.id);
      this.update();
    } else {
      console.log('creating...');
      this.create();
    }
  }

  update() {
    let cat: Category = this.catCtrl.value;
    let acc: Account = this.selectedAccount;
    let payee: Payee = new Payee();


    this.transactionService.updateTransaction(
      this.newTransaction.id,
      this.newTransaction,
      acc,
      cat,
      this.activeBudget
    );
  }

  create() {
    // console.log(this.catCtrl.value);
    let cat: Category = this.catCtrl.value;

    this.newTransaction.categoryId = cat.id;
    this.newTransaction.category = cat.name;

    let acc: Account = this.selectedAccount;
    this.newTransaction.account = acc.name;
    this.newTransaction.accountId = acc.id;

    let payee: Payee = new Payee();
    payee.name = this.newTransaction.payee;

    this.transactionService.createTransaction(
      this.newTransaction,
      acc,
      cat,
      payee,
      this.activeBudget,
      this.userId,
      this.activeBudget.id,
    ).then(response => {
      console.log('Document Ref:', response);
      this.openSnackBar('Created transaction successfully');
    });
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'DISMISS', {
      duration: 2000
    });
  }

  cancel() {
    this.newTransaction = new Transaction({
      date: new Date()
    });
    this.selectedAccount = null;
    this.catCtrl.setValue(null);
  }
}
