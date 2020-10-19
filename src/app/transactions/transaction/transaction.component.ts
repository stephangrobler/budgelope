import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestoreDocument } from '@angular/fire/firestore';

import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject, Subscription } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { Transaction, TransactionTypes } from '../../shared/transaction';
import { Account, IAccountId } from '../../shared/account';
import { Budget } from '../../shared/budget';
import { Category } from '../../shared/category';
import { BudgetService } from '../../budgets/budget.service';
import { UserService } from '../../shared/user.service';
import { TransactionService } from '../transaction.service';
import { AccountService } from '../../accounts/account.service';
import { CategoryService } from '../../categories/category.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

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
  categories: Category[];
  systemCategories: Category[];
  selectedAccount: Account;
  transferBox = false;
  savingInProgress = false;
  unsubscribe = new Subject<boolean>();

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<TransactionComponent>,
    private userService: UserService,
    private budgetService: BudgetService,
    private transactionService: TransactionService,
    private accountService: AccountService,
    private categoryService: CategoryService,
    private router: Router,
    private route: ActivatedRoute,
    public snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.initForm();

    this.userService
      .getProfile()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(profile => {
        const budgetSubscription = this.budgetService
          .getActiveBudget()
          .subscribe(budget => {
            this.activeBudget = budget;
            this.activeBudget.id = profile.activeBudget;
          });
        this.subscriptions.add(budgetSubscription);

        // get the budget accounts
        this.accountService
          .getAll()
          .pipe(take(1))
          .subscribe(accounts => {
            this.accounts = accounts;
          });

        const categorySubscription = this.categoryService
          .getWithQuery({ budgetId: profile.activeBudget, orderBy: 'name' })
          .pipe(take(1))
          .subscribe(categories => {
            this.systemCategories = categories.filter(
              category => category.type === 'system'
            );
            this.categories = categories.filter(category => {
              return (
                (category.parentId || category.parent) !== '' &&
                category.type !== 'system'
              );
            });
            this.route.paramMap.subscribe(params => {
              if (!params.get('id')) {
                return;
              }
              this.transactionId = params.get('id');
              this.loadTransaction(params.get('id'));
            });
          });
        this.subscriptions.add(categorySubscription);
      });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
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

  loadTransaction(transactionId: string) {
    const subscription = this.transactionService
      .getByKey(transactionId)
      .pipe(take(1))
      .subscribe(transaction => {
        this.clearFormCategories(
          <FormArray>this.transactionForm.get('categories')
        );

        const selectedAccount = this.accounts.filter(
          account => transaction.account.id === account.id
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
                category: new FormControl(
                  selectedCategory,
                  Validators.required
                ),
                in: new FormControl(+item.in),
                out: new FormControl(+item.out)
              });
              (<FormArray>this.transactionForm.get('categories')).push(
                categoryGroup
              );
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
      this.transactionService
        .removeTransaction(this.activeBudget.id, this.transactionId)
        .then(() => {
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

  /**
   * Update the transaction
   *
   * @param form FormGroup
   */
  update(form: FormGroup) {
    const transaction = { ...form.value } as Transaction;

    // id is needed to update correctly
    transaction.id = this.transactionId;

    // calculate the amount and set the in or out values
    transaction.amount = this.transactionService.calculateAmount(transaction);

    this.transactionService
      .updateTransaction(this.activeBudget.id, transaction)
      .then(() => {
        this.savingInProgress = false;
        this.openSnackBar('Updated transaction successfully');
      });
  }

  /**
   * Transfer from one account to another
   *
   * @param form FormGroup
   */
  async transfer(form: FormGroup) {
    const transaction = { ...form.value } as Transaction;
    transaction.amount = form.get('transferAmount').value;
    delete(transaction['transferAccount']);
    delete(transaction['transferAmount']);
    delete(transaction['categories']);

    const fromAccount = form.get('account').value;
    const toAccount = form.get('transferAccount').value;

    // first the from account transaction
    const from = await this.fromTransaction(transaction, fromAccount, toAccount.name);

    // switch accounts to let the correct things get updated
    const to = await this.toTransaction(transaction, toAccount, fromAccount.name);
    this.openSnackBar('Transfer Successfull.');
  }

  private toTransaction(
    transaction: Transaction,
    toAccount: IAccountId,
    fromAccountName: string
  ) {
    const toTransaction = {
      ...transaction,
      account: {
        id: toAccount.id,
        name: toAccount.name
      },
      categories: {},
      amount: Math.abs(transaction.amount),
      payee: 'Transfer from ' + fromAccountName,
      type: TransactionTypes.INCOME,
      cleared: false
    }
    return this.transactionService.createTransaction(
      toTransaction,
      this.activeBudget.id
    );
  }

  private fromTransaction(transaction: Transaction, fromAccount: IAccountId, toAccountName: string) {
    const fromTransaction = {
      ...transaction,
      account: {
        id: fromAccount.id,
        name: fromAccount.name
      },
      amount: -Math.abs(transaction.amount),
      payee: 'Transfer to ' + toAccountName,
      type: TransactionTypes.EXPENSE,
      cleared: false,
    };
    return this.transactionService.createTransaction(
      fromTransaction,
      this.activeBudget.id
    );
  }

  create(form: FormGroup) {
    const transaction = { ...form.value };
    transaction.categories = (<FormArray>form.get('categories')).value.reduce(
      (map, curval) => {
        map[curval.category.id] = {
          name: curval.category.name,
          in: curval.in,
          out: curval.out
        };
        return map;
      },
      {}
    );
    // calculate the amount and set the in or out values
    transaction.amount = this.transactionService.calculateAmount(transaction);
    if (transaction.amount > 0) {
      transaction.type = TransactionTypes.INCOME;
    } else {
      transaction.type = TransactionTypes.EXPENSE;
    }

    this.transactionService
      .createTransaction(transaction, this.activeBudget.id)
      .then(() => {
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
