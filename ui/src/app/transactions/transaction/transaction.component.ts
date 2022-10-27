import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestoreDocument } from '@angular/fire/firestore';

import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { filter, map, startWith, take, takeUntil, tap } from 'rxjs/operators';
import { Transaction, TransactionTypes } from '../../shared/transaction';
import { IAccount } from '../../shared/account';
import { Budget } from '../../shared/budget';
import { Category } from '../../shared/category';
import { BudgetService } from '../../budgets/budget.service';
import { UserService } from '../../shared/user.service';
import { TransactionService } from '../transaction.service';
import { AccountService } from '../../accounts/account.service';
import { CategoryService } from '../../categories/category.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService } from 'app/shared/auth.service';
import { PayeeService } from 'app/payees/payee.service';
import { IPayee } from 'app/shared/payee';

@Component({
  selector: 'app-transaction',
  templateUrl: 'transaction.component.html',
  styleUrls: ['./transaction.component.scss'],
})
export class TransactionComponent implements OnInit, OnDestroy {
  transactionForm: FormGroup;
  transactionId: string = null;
  subscriptions = new Subscription();

  title = 'Transaction';
  userId: string;
  activeBudget: Budget;
  item: AngularFirestoreDocument<any>;
  accounts: IAccount[];
  categories: Category[];
  systemCategories: Category[];
  selectedAccount: IAccount;
  transferBox = false;
  savingInProgress = false;
  unsubscribe = new Subject<boolean>();
  user: any;
  payees: IPayee[];
  payeesOptions: Observable<IPayee[]>;
  categoryOptions: Observable<Category[]>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<TransactionComponent>,
    private authService: AuthService,
    private budgetService: BudgetService,
    private transactionService: TransactionService,
    private accountService: AccountService,
    private categoryService: CategoryService,
    private payeeService: PayeeService,
    private router: Router,
    private route: ActivatedRoute,
    public snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.initForm();

    this.authService.currentUser
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((user) => {
        if (!user) return;
        this.user = user;
        // get the budget accounts
        this.accountService.filteredEntities$
          .pipe(take(1))
          .subscribe((accounts) => {
            this.accounts = accounts;
          });

        this.payeeService.filteredEntities$
          .pipe(tap(console.log), takeUntil(this.unsubscribe))
          .subscribe((payees) => (this.payees = payees));

        this.categoryService.filteredEntities$.subscribe((categories) => {
          this.systemCategories = categories.filter(
            (category) => category.type === 'system'
          );
          this.categories = categories.filter((category) => {
            return category.category_group_id !== '' && category.type !== 'system';
          });
          this.route.paramMap.subscribe((params) => {
            if (!params.get('id')) {
              return;
            }
            this.transactionId = params.get('id');
            this.loadTransaction(params.get('id'));
          });
        });
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
      categories: new FormArray([]),
    });

    this.payeesOptions = this.transactionForm.get('payee')!.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : value.name)),
      map((name) => this._filterPayees(name))
    );

    this.onAddCategory();
  }

  private _filterPayees(name: string): IPayee[] {
    const filterValue = name.toLowerCase();
    let results = this.payees.filter((payee) =>
      payee.name.toLowerCase().includes(filterValue)
    );

    if (results.length == 0) {
      results.push({ name: `Add ${name}?` });
    }
    return results;
  }

  public payeeOption(option) {
    if (!option.value.name) {
      return;
    }
    const payee = option.value.name;

    if (payee.indexOf('Add') > -1 && payee.indexOf('?') > 0) {
      const name = payee.replace('Add', '').replace('?', '');
      this.payeeService.add({ name, budget_id: this.user.active_budget_id });
    }
  }

  displayFn(payee: IPayee): string {
    return payee && payee.name ? payee.name : '';
  }

  loadTransaction(transactionId: string) {
    const subscription = this.transactionService
      .getByKey(transactionId)
      .pipe(take(1))
      .subscribe((transaction) => {
        this.clearFormCategories(
          <FormArray>this.transactionForm.get('categories')
        );

        const selectedAccount = this.accounts.filter(
          (account) => transaction.account_id === account._id
        )[0];

        this.transactionForm.get('account').setValue(selectedAccount);
        this.transactionForm.get('date').setValue(transaction.date);
        this.transactionForm.get('payee').setValue(transaction.payee);
        this.transactionForm.get('memo').setValue(transaction.memo);
        this.transactionForm.get('type').setValue(transaction.type);
        this.transactionForm.get('cleared').setValue(transaction.cleared);
        // if (transaction.categories) {
        //   for (const key in transaction.categories) {
        //     if (transaction.categories.hasOwnProperty(key)) {
        //       const item = transaction.categories[key];

        //       const selectedCategory = this.categories.filter((category) => {
        //         return key === category._id;
        //       })[0];

        //       const categoryGroup = new FormGroup({
        //         category: new FormControl(
        //           selectedCategory,
        //           Validators.required
        //         ),
        //         in: new FormControl(+item.in),
        //         out: new FormControl(+item.out),
        //       });
        //       (<FormArray>this.transactionForm.get('categories')).push(
        //         categoryGroup
        //       );
        //     }
        //   }
        // }
      });
    this.subscriptions.add(subscription);
  }

  onAddCategory() {
    const categoryGroup = new FormGroup({
      category: new FormControl(null),
      in: new FormControl(null),
      out: new FormControl(null),
    });

    this.categoryOptions = categoryGroup.get('category').valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : value.name)),
      map((value) => this._filterCategory(value))
    );

    (<FormArray>this.transactionForm.get('categories')).push(categoryGroup);
  }

  private _filterCategory(name: string) {
    const filterValue = name.toLowerCase();
    return this.categories.filter((category) =>
      category.name.toLowerCase().includes(filterValue)
    );
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
        .removeTransaction(this.activeBudget._id, this.transactionId)
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
      .updateTransaction(this.activeBudget._id, transaction)
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
    delete transaction['transferAccount'];
    delete transaction['transferAmount'];
    delete transaction['categories'];

    const fromAccount = form.get('account').value;
    const toAccount = form.get('transferAccount').value;

    // first the from account transaction
    const from = await this.fromTransaction(
      transaction,
      fromAccount,
      toAccount.name
    );

    // switch accounts to let the correct things get updated
    const to = await this.toTransaction(
      transaction,
      toAccount,
      fromAccount.name
    );
    this.openSnackBar('Transfer Successfull.');
  }

  private toTransaction(
    transaction: Transaction,
    toAccount: IAccount,
    fromAccountName: string
  ) {
    // const toTransaction = {
    //   ...transaction,
    //   account: {
    //     id: toAccount._id,
    //     name: toAccount.name,
    //   },
    //   categories: {},
    //   amount: Math.abs(transaction.amount),
    //   payee: 'Transfer from ' + fromAccountName,
    //   type: TransactionTypes.INCOME,
    //   cleared: false,
    // };
    // return this.transactionService.createTransaction(
    //   toTransaction,
    //   this.activeBudget._id
    // );
  }

  private fromTransaction(
    transaction: Transaction,
    fromAccount: IAccount,
    toAccountName: string
  ) {
    // const fromTransaction = {
    //   ...transaction,
    //   account: {
    //     id: fromAccount._id,
    //     name: fromAccount.name,
    //   },
    //   amount: -Math.abs(transaction.amount),
    //   payee: 'Transfer to ' + toAccountName,
    //   type: TransactionTypes.EXPENSE,
    //   cleared: false,
    // };
    // return this.transactionService.createTransaction(
    //   fromTransaction,
    //   this.activeBudget._id
    // );
  }

  create(form: FormGroup) {
    const transaction = { ...form.value };

    if (transaction.payee) {
      transaction.payee_id = transaction.payee._id;
      transaction.payee = transaction.payee._id;
    }

    if (transaction.categories.length === 1) {
      transaction.category_id = transaction.categories[0].category._id;
      transaction.category = transaction.categories[0].category;
    }
    transaction.account_id = transaction.account._id;
    transaction.budget_id = this.user.active_budget_id;
    // calculate the amount and set the in or out values
    transaction.amount = this.transactionService.calculateAmount(transaction);
    if (transaction.amount > 0) {
      transaction.type = TransactionTypes.INCOME;
    } else {
      transaction.type = TransactionTypes.EXPENSE;
    }

    this.transactionService
      .createTransaction(transaction, this.user.active_budget_id)
      .then(() => {
        const date = transaction.date;
        // this.transactionForm.reset();
        // // set the date again and last used account
        this.transactionForm.get('date').setValue(date);
        this.savingInProgress = false;
        this.openSnackBar('Created transaction successfully');
      });
  }

  openSnackBar(message: string) {
    this.snackBar.open(message, 'DISMISS', {
      duration: 2000,
    });
  }

  cancel() {
    this.transactionForm.reset();
    this.clearFormCategories(<FormArray>this.transactionForm.get('categories'));
    this.onAddCategory();
    this.transactionId = null;
  }
}
