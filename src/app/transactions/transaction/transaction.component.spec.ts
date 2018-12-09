import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  MatTableModule,
  MatCardModule,
  MatDatepickerModule,
  MatFormFieldModule,
  MatSelectModule,
  MatSnackBar,
  MatNativeDateModule,
  MatCheckboxModule,
  MatInputModule
} from '@angular/material';
import { TestBed, async } from '@angular/core/testing';
import { TransactionComponent } from './transaction.component';
import { TransactionService } from './../transaction.service';
import { BudgetService } from '../../budgets/budget.service';
import { UserService } from '../../shared/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import {
  ReactiveFormsModule,
  FormsModule,
  FormArray,
  FormGroup,
  FormControl
} from '@angular/forms';
import { AccountService } from '../../accounts/account.service';
import { Account } from '../../shared/account';
import { CategoryService } from '../../categories/category.service';

import { ActivatedRouteStub } from '../../../testing/activate-route-stub';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Category } from '../../shared/category';
import { Budget } from '../../shared/budget';
import { Transaction } from '../../shared/transaction';
import { reject } from 'q';

describe('TransactionsComponent', () => {
  let transactionServiceStub;

  const BudgetServiceStub = jasmine.createSpyObj('BudgetService', [
    'getTransactions',
    'getActiveBudget$'
  ]);
  const UserServiceStub = jasmine.createSpyObj('UserService', ['getUser', 'getProfile$']);
  const RouterStub = jasmine.createSpyObj('Router', ['navigate']);
  let accountServiceStub, categoryServiceStub, matSnackBarStub, activatedRouteStub;
  const angularFireAuthServiceStub = jasmine.createSpyObj('AngularFireAuth', ['authenticate']);
  angularFireAuthServiceStub.authState = of([]);

  const angularFirestoreServiceStub = jasmine.createSpyObj('AngularFirestore', [
    'doc',
    'collection'
  ]);
  angularFirestoreServiceStub.doc.and.returnValue({
    valueChanges: function() {
      return of({});
    }
  });

  beforeEach(async(() => {
    activatedRouteStub = new ActivatedRouteStub();
    activatedRouteStub.setParamMap({
      id: '201805'
    });
    transactionServiceStub = jasmine.createSpyObj('TransactionService', [
      'getTransactions',
      'getTransaction',
      'createTransaction',
      'removeTransaction',
      'calculateAmount'
    ]);
    transactionServiceStub.getTransactions.and.returnValue(of([]));
    transactionServiceStub.createTransaction.and.returnValue({
      then: (success, failure) => {
        success();
      }
    });
    transactionServiceStub.removeTransaction.and.returnValue({
      then: (success, failure) => {
        success();
      }
    });
    accountServiceStub = jasmine.createSpyObj('AccountService', [
      'getAccounts',
      'updateAccountBalance'
    ]);
    accountServiceStub.getAccounts.and.returnValue(of([]));

    categoryServiceStub = jasmine.createSpyObj('CategoryService', [
      'getCategories',
      'updateCategory'
    ]);
    categoryServiceStub.getCategories.and.returnValue(of([]));

    matSnackBarStub = jasmine.createSpyObj('MatSnackBar', ['open']);

    transactionServiceStub.getTransaction.and.returnValue(
      of({
        date: '2018-01-01',
        payee: 'Test Payee',
        categories: [{ categoryId: 'test', category: 'test cat name', in: 0, out: 500 }]
      })
    );
    UserServiceStub.getProfile$.and.returnValue(
      of({
        uid: '09876',
        activeBudget: '54321'
      })
    );
    BudgetServiceStub.getActiveBudget$.and.returnValue(
      of({
        id: '54321'
      })
    );

    TestBed.configureTestingModule({
      declarations: [TransactionComponent],
      imports: [
        MatTableModule,
        MatCardModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatSelectModule,
        MatCheckboxModule,
        MatInputModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        FormsModule,
        MatNativeDateModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        {
          provide: AngularFirestore,
          useValue: angularFirestoreServiceStub
        },
        {
          provide: AngularFireAuth,
          useValue: angularFireAuthServiceStub
        },
        {
          provide: TransactionService,
          useValue: transactionServiceStub
        },
        {
          provide: BudgetService,
          useValue: BudgetServiceStub
        },
        {
          provide: UserService,
          useValue: UserServiceStub
        },
        {
          provide: Router,
          useValue: RouterStub
        },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        {
          provide: AccountService,
          useValue: accountServiceStub
        },
        {
          provide: CategoryService,
          useValue: categoryServiceStub
        },
        {
          provide: MatSnackBar,
          useValue: matSnackBarStub
        }
      ]
    }).compileComponents();
  }));

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(TransactionComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it(`should have as title 'Transactions'`, async(() => {
    const fixture = TestBed.createComponent(TransactionComponent);
    const app = fixture.debugElement.componentInstance;

    expect(app.title).toEqual('Transaction');
  }));

  it('should update the old account and new selected account', () => {
    const fixture = TestBed.createComponent(TransactionComponent);
    const account = new Account();
    const oldAccount = new Account();
    const budget = (fixture.componentInstance.activeBudget = new Budget());
    budget.id = 'CurrentBudgetID';
    account.balance = 500;
    oldAccount.balance = 500;

    fixture.componentInstance.updateAccount(500, oldAccount, account);

    expect(accountServiceStub.updateAccountBalance).toHaveBeenCalledTimes(2);
  });

  it('should update the old account and new selected account', () => {
    const fixture = TestBed.createComponent(TransactionComponent);
    const account = new Account();
    const oldAccount = new Account();
    const budget = (fixture.componentInstance.activeBudget = new Budget());
    budget.id = 'CurrentBudgetID';
    account.id = 'acc1';
    account.balance = 500;
    oldAccount.id = 'acc2';
    oldAccount.balance = 500;

    fixture.componentInstance.updateAccount(500, oldAccount, account);

    expect(accountServiceStub.updateAccountBalance).toHaveBeenCalledWith(
      'acc2',
      'CurrentBudgetID',
      500
    );
  });

  it('should update the old account and new selected account', () => {
    const fixture = TestBed.createComponent(TransactionComponent);
    const account = new Account();
    const oldAccount = new Account();
    const budget = (fixture.componentInstance.activeBudget = new Budget());
    budget.id = 'CurrentBudgetID';

    account.id = 'acc1';
    account.balance = 1000;
    oldAccount.id = 'acc2';
    oldAccount.balance = 0;

    fixture.componentInstance.updateAccount(-500, oldAccount, account);

    expect(accountServiceStub.updateAccountBalance).toHaveBeenCalledWith(
      'acc1',
      'CurrentBudgetID',
      -500
    );
  });

  it('should display an additional account drop down if type is transfer', () => {
    const fixture = TestBed.createComponent(TransactionComponent);
    fixture.detectChanges();
    const comp = fixture.debugElement.componentInstance;
  });

  it('should call the transfer function', () => {
    categoryServiceStub.getCategories.and.returnValue(
      of([{ id: 'cat1', name: 'Transfer In', type: 'system' }, { id: 'cat2', name: 'Transfer Out', type: 'system' }])
    );

    const fixture = TestBed.createComponent(TransactionComponent);
    fixture.detectChanges();
    const comp = fixture.debugElement.componentInstance;
    const form = fixture.componentInstance.transactionForm;
    form.get('account').setValue({ id: 'acc1', name: 'acc1Name' });
    form.get('transferAccount').setValue({ id: 'acc2', name: 'Test Account 2' });
    form.get('transferAmount').setValue(500);
    form.get('transfer').setValue(true);

    comp.transfer(form);

    expect(transactionServiceStub.createTransaction).toHaveBeenCalledTimes(2);
  });

  it('should call the transfer function with a from Transaction of values', () => {
    categoryServiceStub.getCategories.and.returnValue(
      of([{ id: 'cat1', name: 'Transfer In', type: 'system' }, { id: 'cat2', name: 'Transfer Out', type: 'system' }])
    );

    const fixture = TestBed.createComponent(TransactionComponent);
    fixture.detectChanges();
    const comp = fixture.debugElement.componentInstance;
    const form = fixture.componentInstance.transactionForm;
    form.get('account').setValue({ id: 'acc1', name: 'acc1Name' });
    form.get('transferAccount').setValue({ id: 'acc2', name: 'Test Account 2' });
    form.get('transferAmount').setValue(500);
    form.get('transfer').setValue(true);

    const transaction = new Transaction(form.value);
    transaction.account = {
      accountId: 'acc1',
      accountName: 'acc1Name'
    };
    transaction.accountDisplayName = transaction.account.accountName;
    transaction.categories['cat2'] = { categoryName: 'Transfer Out', in: 0, out: 500 };
    transaction.amount = -500;
    transaction.out = -500;

    comp.transfer(form);

    expect(transactionServiceStub.createTransaction).toHaveBeenCalledWith(
      jasmine.objectContaining({ categoryDisplayName: 'Transfer to Test Account 2' }),
      '54321'
    );
  });

  it('should call the transfer function with a to Transaction of values', () => {
    categoryServiceStub.getCategories.and.returnValue(
      of([{ id: 'cat1', name: 'Transfer In', type: 'system' }, { id: 'cat2', name: 'Transfer Out', type: 'system' }])
    );

    const fixture = TestBed.createComponent(TransactionComponent);
    fixture.detectChanges();
    const comp = fixture.debugElement.componentInstance;
    const form = fixture.componentInstance.transactionForm;
    form.get('account').setValue({ id: 'acc1', name: 'acc1Name' });
    form.get('transferAccount').setValue({ id: 'acc2', name: 'Test Account 2' });
    form.get('transferAmount').setValue(500);
    form.get('transfer').setValue(true);

    const transaction = new Transaction(form.value);
    transaction.account = {
      accountId: 'acc2',
      accountName: 'Test Account 2'
    };
    transaction.transferAccount = {
      accountId: 'acc1',
      accountName: 'acc1Name'
    };
    transaction.accountDisplayName = transaction.account.accountName;
    transaction.categories['cat1'] = {categoryName: 'Transfer In', in: 500, out: 0 };

    transaction.amount = 500;
    transaction.in = 500;

    comp.transfer(form);

    expect(transactionServiceStub.createTransaction).toHaveBeenCalledWith(
      jasmine.objectContaining({ categoryDisplayName: 'Transfer from acc1Name' }),
      '54321'
    );
  });

  it('should update the categories and call update 3 times', () => {
    const fixture = TestBed.createComponent(TransactionComponent);

    fixture.componentInstance.activeBudget = new Budget();
    fixture.componentInstance.activeBudget.id = 'TestBudgetID';

    const category1 = new Category(),
      category2 = new Category(),
      category3 = new Category();

    const oldCategories = new FormArray([
      new FormGroup({
        category: new FormControl(category1),
        in: new FormControl(0),
        out: new FormControl(100)
      })
    ]);

    const newCategories = new FormArray([
      new FormGroup({
        category: new FormControl(category2),
        in: new FormControl(0),
        out: new FormControl(80)
      }),
      new FormGroup({
        category: new FormControl(category3),
        in: new FormControl(0),
        out: new FormControl(20)
      })
    ]);

    fixture.componentInstance.updateCategories(oldCategories, newCategories);

    expect(categoryServiceStub.updateCategory).toHaveBeenCalledTimes(3);
  });

  it('should update the categories and call update with specific parameters', () => {
    const fixture = TestBed.createComponent(TransactionComponent);
    const category1 = new Category(),
      category2 = new Category(),
      category3 = new Category();

    fixture.componentInstance.activeBudget = new Budget();
    fixture.componentInstance.activeBudget.id = 'TestBudgetID';

    category1.balance = 0;
    category2.balance = 100;
    category3.balance = 100;

    const oldCategories = new FormArray([
      new FormGroup({
        category: new FormControl(category1),
        in: new FormControl(0),
        out: new FormControl(100)
      })
    ]);

    const newCategories = new FormArray([
      new FormGroup({
        category: new FormControl(category2),
        in: new FormControl(0),
        out: new FormControl(80)
      }),
      new FormGroup({
        category: new FormControl(category3),
        in: new FormControl(0),
        out: new FormControl(20)
      })
    ]);

    fixture.componentInstance.updateCategories(oldCategories, newCategories);

    expect(categoryServiceStub.updateCategory.calls.allArgs()).toEqual([
      [jasmine.anything(), jasmine.objectContaining({ balance: 100 })],
      [jasmine.anything(), jasmine.objectContaining({ balance: 20 })],
      [jasmine.anything(), jasmine.objectContaining({ balance: 80 })]
    ]);
  });

  it('should update the categories and call update with specific parameters reduced category count', () => {
    const fixture = TestBed.createComponent(TransactionComponent);
    const category1 = new Category(),
      category2 = new Category(),
      category3 = new Category();

    fixture.componentInstance.activeBudget = new Budget();
    fixture.componentInstance.activeBudget.id = 'TestBudgetID';

    category1.balance = 0;
    category2.balance = 100;
    category3.balance = 100;

    const oldCategories = new FormArray([
      new FormGroup({
        category: new FormControl(category1),
        in: new FormControl(0),
        out: new FormControl(100)
      }),
      new FormGroup({
        category: new FormControl(category2),
        in: new FormControl(0),
        out: new FormControl(80)
      })
    ]);

    const newCategories = new FormArray([
      new FormGroup({
        category: new FormControl(category3),
        in: new FormControl(0),
        out: new FormControl(180)
      })
    ]);

    fixture.componentInstance.updateCategories(oldCategories, newCategories);

    expect(categoryServiceStub.updateCategory.calls.allArgs()).toEqual([
      [jasmine.anything(), jasmine.objectContaining({ balance: 100 })],
      [jasmine.anything(), jasmine.objectContaining({ balance: 180 })],
      [jasmine.anything(), jasmine.objectContaining({ balance: -80 })]
    ]);
  });

  it('should update the categories and call update with specific parameters reduced category count', () => {
    const fixture = TestBed.createComponent(TransactionComponent);
    const category1 = new Category(),
      category2 = new Category(),
      category3 = new Category();

    fixture.componentInstance.activeBudget = new Budget();
    fixture.componentInstance.activeBudget.id = 'TestBudgetID';

    category1.balance = 0;
    category2.balance = 100;
    category3.balance = 100;

    const oldCategories = new FormArray([
      new FormGroup({
        category: new FormControl(category1),
        in: new FormControl(0),
        out: new FormControl(100)
      }),
      new FormGroup({
        category: new FormControl(category2),
        in: new FormControl(0),
        out: new FormControl(80)
      })
    ]);

    const newCategories = new FormArray([
      new FormGroup({
        category: new FormControl(category3),
        in: new FormControl(0),
        out: new FormControl(180)
      })
    ]);

    fixture.componentInstance.updateCategories(oldCategories, newCategories);

    expect(categoryServiceStub.updateCategory.calls.allArgs()).toEqual([
      [jasmine.anything(), jasmine.objectContaining({ balance: 100 })],
      [jasmine.anything(), jasmine.objectContaining({ balance: 180 })],
      [jasmine.anything(), jasmine.objectContaining({ balance: -80 })]
    ]);
  });

  it('should create a new single category transaction', () => {
    // arrange
    activatedRouteStub.setParamMap({});
    transactionServiceStub.calculateAmount.and.returnValue(500);
    const fixture = TestBed.createComponent(TransactionComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    const form = fixture.componentInstance.transactionForm;
    form.get('account').setValue({ id: 'acc1', name: 'acc1Name' });
    form
      .get('categories')
      .setValue([{ category: { id: 'cat1', name: 'cat1Name' }, in: 0, out: 500 }]);

    // action
    comp.create(comp.transactionForm);

    // assert
    expect(transactionServiceStub.createTransaction).toHaveBeenCalledWith(
      jasmine.objectContaining({ amount: 500, in: 500 }),
      jasmine.any(String)
    );
  });

  it('should delete a transaction', () => {
    // arrange
    activatedRouteStub.setParamMap({});
    transactionServiceStub.calculateAmount.and.returnValue(500);
    const fixture = TestBed.createComponent(TransactionComponent);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    const form = fixture.componentInstance.transactionForm;
    comp.transactionId = '12345';
    form.get('account').setValue({ id: 'acc1', name: 'acc1Name' });
    form
      .get('categories')
      .setValue([{ category: { id: 'cat1', name: 'cat1Name' }, in: 0, out: 500 }]);

    // action
    comp.onDelete();

    // assert
    expect(transactionServiceStub.removeTransaction).toHaveBeenCalledWith('54321', '12345' );
  });
});
