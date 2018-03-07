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

import { Transaction } from '../../shared/transaction';
import { Account } from '../../shared/account';
import { Budget } from '../../shared/budget';
import { Payee } from '../../shared/payee';
import { Category, CategoryId } from '../../shared/category';
import { BudgetService } from '../../core/budget.service';
import { UserService } from '../../core/user.service';
import { TransactionService } from '../../core/transaction.service';
import { AccountService } from '../../core/account.service';


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

  selectedAccount: Account;

  catCtrl: FormControl;
  filteredCategories: any;

  constructor(
    private userService: UserService,
    private budgetService: BudgetService,
    private transactionService: TransactionService,
    private accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute,
    private db: AngularFirestore,
    private af: AngularFireAuth,
    public snackBar: MatSnackBar

  ) {
    af.authState.subscribe((user) => {
      if (!user) {
        return;
      }
      let profile = db.doc<any>('users/' + user.uid).valueChanges().subscribe(profile => {
        db.doc<Budget>('budgets/' + profile.activeBudget).valueChanges().subscribe(budget => {
          budget.id = profile.activeBudget;
          return this.activeBudget = budget;
        });
      });
    });
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
          this.transaction = new Transaction();
        }
        // get the budget accounts
        this.accountService.getAccounts(profile.activeBudget).subscribe(accounts => this.accounts = accounts);

        this.db.collection<Category>('budgets/' + profile.activeBudget + '/categories').snapshotChanges()
          .map(actions => {
            return actions.map(a => {
              const data = a.payload.doc.data() as CategoryId;
              const id = a.payload.doc.id;
              return { id, ...data };
            });
          }).subscribe(categories => {
            this.categories = categories;
          });
        // this.db.object('allocations/' + moment().format("YYYYMM"))
      });
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
      this.openSnackBar('Created transaction successfully');
    });
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'DISMISS', {
      duration: 2000
    });
  }

  updateAccount(account: any) {
    let accItem = this.db.doc('/accounts/' + this.activeBudget + '/' + account.$key);
    let balance = account.balance;
    if (this.transaction.type == 'expense') {
      balance -= this.transaction.amount;
    } else if (this.transaction.type == 'income') {
      balance += this.transaction.amount;
    }
    accItem.update({ "balance": balance }).then(response => {
      alert('account updated from ' + account.balance + ' to ' + balance);
    })
  }

  cancel() {
    this.router.navigate(['/budgetview/transactions']);
  }
}
