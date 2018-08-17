import { Component, OnInit, OnChanges, Input, SimpleChange } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute, Params, ParamMap } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';

import { MatSnackBar } from '@angular/material';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import * as moment from 'moment';
import { Profile } from '../../shared/profile';
import { Transaction } from '../../shared/transaction';
import { Account } from '../../shared/account';
import { Budget } from '../../shared/budget';
import { Payee } from '../../shared/payee';
import { Category, CategoryId } from '../../shared/category';
import { BudgetService } from '../../budgets/budget.service';
import { UserService } from '../../shared/user.service';
import { TransactionService } from '../transaction.service';
import { AccountService } from '../../accounts/account.service';
import { CategoryService } from '../../categories/category.service';

@Component({
  selector: 'app-transaction',
  templateUrl: 'transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {
  transactionForm: FormGroup;
  transactionId: string;

  title = 'Transaction';
  userId: string;
  activeBudget: Budget;
  item: AngularFirestoreDocument<any>;
  accounts: Account[];
  categories: CategoryId[];
  selectedAccount: Account;

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
  ) {}

  ngOnInit() {
    this.initForm();

    this.userService.getProfile$().subscribe(profile => {
      this.budgetService.getActiveBudget$().subscribe(budget => {
        this.activeBudget = budget;
      });

      // get the budget accounts
      this.accountService
        .getAccounts(profile.activeBudget)
        .subscribe(accounts => (this.accounts = accounts));

      this.categoryService.getCategories(profile.activeBudget).subscribe(categories => {
        this.categories = categories;

        this.route.paramMap.subscribe(params => {
          if (!params.get('id')) {
            return;
          }
          this.loadTransaction(params.get('id'), profile.activeBudget);
        });
      });
    });
  }

  private initForm() {
    const transactionAccount = '';
    const date = new Date();
    const payee = '';
    const amount = '';

    this.transactionForm = new FormGroup({
      account: new FormControl(null, [Validators.required]),
      transferAccount: new FormControl(null),
      transferAmount: new FormControl(null),
      date: new FormControl(date, Validators.required),
      payee: new FormControl(null, Validators.required),
      cleared: new FormControl(false),
      transfer: new FormControl(false),
      categories: new FormArray([])
    });
    this.onAddCategory();
  }

  loadTransaction(transactionId: string, budgetId: string) {
    this.transactionService
      .getTransaction(budgetId, transactionId)
      .pipe(take(1))
      .subscribe(transaction => {
        this.mapTransaction(transaction);

        this.clearFormCategories(<FormArray>this.transactionForm.get('categories'));

        const selectedAccount = this.accounts.filter(
          account => transaction.account.accountId === account.id
        )[0];

        this.transactionForm.get('account').setValue(selectedAccount);
        this.transactionForm.get('date').setValue(transaction.date);
        this.transactionForm.get('payee').setValue(transaction.payee);

        if (transaction.categories) {
          transaction.categories.forEach(item => {
            const selectedCategory = this.categories.filter(category => {
              return item.categoryId === category.id;
            })[0];
            const categoryGroup = new FormGroup({
              category: new FormControl(selectedCategory, Validators.required),
              in: new FormControl(+item.in),
              out: new FormControl(+item.out)
            });
            (<FormArray>this.transactionForm.get('categories')).push(categoryGroup);
          });
        }
      });
  }

  mapTransaction(transaction: any): Transaction {

    transaction.account = {
      accountId : transaction['accountId'],
      accountName : transaction['accountName']
    }
    transaction.accountDisplayName = transaction['accountName'];
    if (transaction.categories.length > 1) {
      transaction.categoryDisplayName = 'Split (' + transaction.categories.length + ')';
    } else {
      transaction.categoryDisplayName = transaction.categories[0].categoryName;
    }
    if (typeof(transaction.date) === 'object') {
      transaction.date = transaction['date'].toDate();
    }
    return transaction;
  }

  onSubmit() {
    console.log(this.transactionForm);
  }

  onAddCategory() {
    const categoryGroup = new FormGroup({
      category: new FormControl(null, Validators.required),
      in: new FormControl(null),
      out: new FormControl(null)
    });

    (<FormArray>this.transactionForm.get('categories')).push(categoryGroup);
  }

  clearFormCategories(formArray: FormArray) {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  getControls() {
    return (<FormArray>this.transactionForm.get('categories')).controls;
  }

  saveTransaction() {
    if (this.transactionId != null) {
      console.log('updating ', this.transactionId);
      // this.update(this.transactionForm);
    } else {
      console.log('creating...');
      this.create(this.transactionForm);
    }
  }

  updateAccount(amount: number, oldAccount: Account, newAccount: Account) {
    oldAccount.balance -= amount;
    newAccount.balance += amount;
    this.accountService.updateAccount(oldAccount, this.activeBudget.id);
    this.accountService.updateAccount(newAccount, this.activeBudget.id);
  }

  /**
   * Updates the categories for the transaction based on changes made to saved
   * transactions
   *
   * @param oldCategories FormArray
   * @param newCategories FormArray
   */
  updateCategories(oldCategories: FormArray, newCategories: FormArray) {
    // reset old categories
    oldCategories.value.forEach(categoryItem => {
      categoryItem.category.balance -= +categoryItem.in;
      categoryItem.category.balance += +categoryItem.out;
      this.categoryService.updateCategory(this.activeBudget.id, categoryItem.category);
    });

    // adjust new categories
    newCategories.value.forEach(categoryItem => {
      categoryItem.category.balance += +categoryItem.in;
      categoryItem.category.balance -= +categoryItem.out;
      this.categoryService.updateCategory(this.activeBudget.id, categoryItem.category);
    });
  }

  update(transaction: Transaction) {
    const cat: Category = this.transactionForm.get('category').value;
    const acc: Account = this.selectedAccount;
    const payee: Payee = new Payee();

    this.transactionService.updateTransaction(
      this.transactionId,
      transaction,
      acc,
      cat,
      this.activeBudget
    );
  }

  create(form: FormGroup) {
    const transaction = new Transaction(form.value);
    transaction.account = {
      accountId: form.value.account.id,
      accountName: form.value.account.name
    };
    transaction.accountDisplayName = transaction.account.accountName;
    // transaction.calculateAmount;

    if (form.value.categories.length > 1) {
      transaction.categoryDisplayName = 'Split';
    } else {
      transaction.categoryDisplayName = form.value.categories[0].category.name;
    }

    // calculate the amount and set the in or out values
    transaction.amount = this.transactionService.calculateAmount(transaction);
    if (transaction.amount > 0) {
      transaction.in = transaction.amount;
    } else {
      transaction.out = Math.abs(transaction.amount);
    };

    this.transactionService
      .createTransaction(
        transaction,
        form.value.account,
        form.value.categories,
        this.activeBudget,
        this.activeBudget.id
      )
      .then(response => {
        this.transactionForm.reset();
        this.openSnackBar('Created transaction successfully');
      });
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'DISMISS', {
      duration: 2000
    });
  }

  cancel() {
    this.transactionForm.reset();
    this.clearFormCategories(<FormArray>this.transactionForm.get('categories'));
    this.onAddCategory();
    this.transactionId = null;
  }
}
