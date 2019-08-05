import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';

import { MatSnackBar } from '@angular/material';
import { Observable, Subscription } from 'rxjs';
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
export class TransactionComponent implements OnInit, OnDestroy {
  transactionForm: FormGroup;
  transactionId: string = null;
  subscriptions = new Subscription();

  title = 'Transaction';
  userId: string;
  activeBudget: Budget;
  item: AngularFirestoreDocument<any>;
  accounts: Account[];
  categories: CategoryId[];
  systemCategories: CategoryId[];
  selectedAccount: Account;
  transferBox = false;
  savingInProgress = false;

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

    const profileSubscription = this.userService.getProfile$().subscribe(profile => {
      const budgetSubscription = this.budgetService.getActiveBudget$().subscribe(budget => {
        this.activeBudget = budget;
        this.activeBudget.id = profile.activeBudget;
      });
      this.subscriptions.add(budgetSubscription);

      // get the budget accounts
      this.accountService
        .getAccounts(profile.activeBudget)
        .pipe(take(1))
        .subscribe(accounts => (this.accounts = accounts));

      const categorySubscription = this.categoryService
        .getCategories(profile.activeBudget, 'name')
        .pipe(take(1))
        .subscribe(categories => {
          this.systemCategories = categories.filter(category => category.type === 'system');
          this.categories = categories.filter(category => {
            return (category.parentId || category.parent) !== '' && category.type !== 'system';
          });
          this.route.paramMap.subscribe(params => {
            if (!params.get('id')) {
              return;
            }
            this.transactionId = params.get('id');
            this.loadTransaction(params.get('id'), profile.activeBudget);
          });
        });
      this.subscriptions.add(categorySubscription);
    });
    this.subscriptions.add(profileSubscription);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private initForm() {
    const date = new Date();

    this.transactionForm = new FormGroup({
      account: new FormControl(null, [Validators.required]),
      transferAccount: new FormControl(null),
      transferAmount: new FormControl(null),
      date: new FormControl(date, Validators.required),
      payee: new FormControl(null),
      memo: new FormControl(null),
      cleared: new FormControl(false),
      transfer: new FormControl(false),
      type: new FormControl(false),
      categories: new FormArray([])
    });
    this.onAddCategory();
  }

  loadTransaction(transactionId: string, budgetId: string) {
    const subscription = this.transactionService
      .getTransaction(budgetId, transactionId)
      .pipe(take(1))
      .subscribe(transaction => {
        this.clearFormCategories(<FormArray>this.transactionForm.get('categories'));

        const selectedAccount = this.accounts.filter(
          account => transaction.account.accountId === account.id
        )[0];

        this.transactionForm.get('account').setValue(selectedAccount);
        this.transactionForm.get('date').setValue(transaction.date);
        this.transactionForm.get('payee').setValue(transaction.payee);
        this.transactionForm.get('memo').setValue(transaction.memo);
        this.transactionForm.get('type').setValue(transaction.type);
        this.transactionForm.get('cleared').setValue(transaction.cleared);
        if (transaction.categories) {
          for (const key in transaction.categories) {
            if (transaction.categories.hasOwnProperty(key)) {
              const item = transaction.categories[key];

              const selectedCategory = this.categories.filter(category => {
                return key === category.id;
              })[0];

              const categoryGroup = new FormGroup({
                category: new FormControl(selectedCategory, Validators.required),
                in: new FormControl(+item.in),
                out: new FormControl(+item.out)
              });
              (<FormArray>this.transactionForm.get('categories')).push(categoryGroup);
            }
          }
        }
      });
    this.subscriptions.add(subscription);
  }

  onAddCategory() {
    const categoryGroup = new FormGroup({
      category: new FormControl(null),
      in: new FormControl(null),
      out: new FormControl(null)
    });

    (<FormArray>this.transactionForm.get('categories')).push(categoryGroup);
  }

  onToggleTransfer() {
    this.transferBox = !this.transferBox;
  }
  clearFormCategories(formArray: FormArray) {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  getControls() {
    return (<FormArray>this.transactionForm.get('categories')).controls;
  }

  onDelete() {
    // TODO: refactor this to a dialog box
    if (confirm('Are you sure you want to delete this transaction?')) {
      if (!this.transactionId) {
        console.log('No id set for transaction');
      }
      this.transactionService.removeTransaction(this.activeBudget.id, this.transactionId).then(() => {
        this.router.navigate(['app/transactions']);
      });
    }
  }

  saveTransaction() {
    this.savingInProgress = true;
    if (this.transactionId != null) {
      console.log('updating ', this.transactionId);
      this.update(this.transactionForm);
    } else if (this.transactionForm.get('transfer').value) {
      console.log('transferring...');
      this.transfer(this.transactionForm);
    } else if (!this.transactionId) {
      console.log('creating...');
      this.create(this.transactionForm);
    } else {
      console.log('Not doing anything');
    }
  }

  updateAccount(amount: number, oldAccount: Account, newAccount: Account) {
    oldAccount.balance -= amount;
    newAccount.balance += amount;
    this.accountService.updateAccountBalance(oldAccount.id, this.activeBudget.id, amount);
    this.accountService.updateAccountBalance(newAccount.id, this.activeBudget.id, amount);
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

  /**
   * Update the transaction
   *
   * @param form FormGroup
   */
  update(form: FormGroup) {
    const transaction = new Transaction(form.value);

    // id is needed to update correctly
    transaction.id = this.transactionId;

    // calculate the amount and set the in or out values
    transaction.amount = this.transactionService.calculateAmount(transaction);

    this.transactionService.updateTransaction(this.activeBudget.id, transaction).then(() => {
      this.savingInProgress = false;
      this.openSnackBar('Updated transaction successfully');
    });
  }

  /**
   * Transfer from one account to another
   *
   * @param form FormGroup
   */
  transfer(form: FormGroup) {
    const fromTransaction = new Transaction(form.value);
    const toTransaction = new Transaction(form.value);
    const fromAccount = form.get('account').value;
    const toAccount = form.get('transferAccount').value;

    const toCategory = this.systemCategories.find(cat => cat.name === 'Transfer In');
    const fromCategory = this.systemCategories.find(cat => cat.name === 'Transfer Out');

    // first the from account transaction
    fromTransaction.account = {
      accountId: fromAccount.id,
      accountName: fromAccount.name
    };
    fromTransaction.accountDisplayName = fromTransaction.account.accountName;

    fromTransaction.categories[fromCategory.id] = {
      categoryName: fromCategory.name,
      in: 0,
      out: fromTransaction.transferAmount
    };
    fromTransaction.payee = toAccount.name;
    fromTransaction.categoryDisplayName = 'Transfer to ' + toAccount.name;
    fromTransaction.amount = 0 - fromTransaction.transferAmount;
    fromTransaction.out = 0 - fromTransaction.transferAmount;

    this.transactionService.createTransaction(fromTransaction, this.activeBudget.id);

    // switch accounts to let the correct things get updated
    toTransaction.account = {
      accountId: toAccount.id,
      accountName: toAccount.name
    };
    toTransaction.transferAccount = {
      accountId: fromAccount.id,
      accountName: fromAccount.name
    };
    toTransaction.accountDisplayName = toTransaction.account.accountName;
    toTransaction.categories = {};
    toTransaction.payee = fromAccount.name;
    toTransaction.categoryDisplayName = 'Transfer from ' + fromAccount.name;
    toTransaction.amount = toTransaction.transferAmount;
    toTransaction.in = toTransaction.transferAmount;

    this.transactionService.createTransaction(toTransaction, this.activeBudget.id);
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
    }
    
    this.transactionService.createTransaction(transaction, this.activeBudget.id).then(response => {
      const date = transaction.date;

      this.transactionForm.reset();
      // set the date again and last used account
      this.transactionForm.get('date').setValue(date);
      this.savingInProgress = false;
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
