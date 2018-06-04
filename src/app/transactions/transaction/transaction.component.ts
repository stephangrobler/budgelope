import { Component, OnInit, OnChanges, Input, SimpleChange } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
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

  ) {
  }

  ngOnInit() {
    this.initForm();
    this.userService.getProfile$().subscribe(profile => {
      this.budgetService.getActiveBudget$().subscribe(budget => {
        this.activeBudget = budget;
      });



      // get the budget accounts
      this.accountService.getAccounts(profile.activeBudget).subscribe(accounts => this.accounts = accounts);

      this.categoryService.getCategories(profile.activeBudget).subscribe(categories => {
        this.categories = categories;
        this.route.params.subscribe((params: Params) => {
          if (!params['id']){
            return;
          }
          this.transactionId = params["id"];

          this.transactionService.getTransaction(profile.activeBudget, this.transactionId)
            .take(1)
            .subscribe(transaction => {
              this.clearFormCategories((<FormArray>this.transactionForm.get('categories')));
              let selectedAccount = this.accounts.filter(account => transaction.accountId == account.id)[0];
              this.transactionForm.get('account').setValue(selectedAccount);
              this.transactionForm.get('date').setValue(transaction.date);
              this.transactionForm.get('payee').setValue(transaction.payee);
              transaction.categories.forEach(item => {
                let selectedCategory = this.categories.filter(category => {
                  return item.categoryId == category.id
                })[0];
                let categoryGroup = new FormGroup({
                  'category': new FormControl(selectedCategory, Validators.required),
                  'in': new FormControl(+item.in),
                  'out': new FormControl(+item.out)
                });
                (<FormArray>this.transactionForm.get('categories')).push(categoryGroup);
              })
            })
        });
      });
    });
  }

  private initForm() {
    let transactionAccount = '';
    let date = new Date();
    let payee = '';
    let amount = '';

    this.transactionForm = new FormGroup({
      'account': new FormControl(null, [Validators.required]),
      'date': new FormControl(date, Validators.required),
      'payee': new FormControl(null, Validators.required),
      'cleared': new FormControl(null),
      'categories': new FormArray([])
    });
    this.onAddCategory();
  }

  onSubmit() {
    console.log(this.transactionForm);
  }

  onAddCategory() {
    let categoryGroup = new FormGroup({
      'category': new FormControl(null, Validators.required),
      'in': new FormControl(null),
      'out': new FormControl(null)
    });

    (<FormArray>this.transactionForm.get('categories')).push(categoryGroup);
  }

  clearFormCategories(formArray: FormArray){
    while(formArray.length !== 0){
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

  update(transaction: Transaction) {
    let cat: Category = this.transactionForm.get('category').value;
    let acc: Account = this.selectedAccount;
    let payee: Payee = new Payee();

    this.transactionService.updateTransaction(
      this.transactionId,
      transaction,
      acc,
      cat,
      this.activeBudget
    );
  }

  create(form: FormGroup) {
    let transaction = new Transaction(form.value);
    transaction.accountId = form.value.account.id;
    transaction.accountName = form.value.account.name;
    transaction.calculateAmount;

    if (form.value.categories.length > 1) {
      transaction.categoryId = '';
      transaction.categoryName = 'Split';
    } else {
      transaction.categoryId = form.value.categories[0].category.id;
      transaction.categoryName = form.value.categories[0].category.name;
    }

    this.transactionService.createTransaction(
      transaction,
      form.value.account,
      form.value.categories,
      this.activeBudget,
      this.userId,
      this.activeBudget.id,
    ).then(response => {
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
    this.clearFormCategories((<FormArray>this.transactionForm.get('categories')));
    this.onAddCategory();
    this.transactionId = null;
  }
}
