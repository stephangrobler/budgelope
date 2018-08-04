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
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Observable';
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

describe('TransactionsComponent', () => {
  const TransactionServiceStub = jasmine.createSpyObj('TransactionService', [
    'getTransactions',
    'getTransaction'
  ]);
  TransactionServiceStub.getTransactions.and.returnValue(Observable.of([]));

  const BudgetServiceStub = jasmine.createSpyObj('BudgetService', [
    'getTransactions',
    'getActiveBudget$'
  ]);
  const UserServiceStub = jasmine.createSpyObj('UserService', ['getUser', 'getProfile$']);
  const RouterStub = jasmine.createSpyObj('Router', ['navigate']);
  let accountServiceStub, categoryServiceStub, matSnackBarStub, activatedRouteStub;
  const angularFireAuthServiceStub = jasmine.createSpyObj('AngularFireAuth', ['authenticate']);
  angularFireAuthServiceStub.authState = Observable.of([]);

  const angularFirestoreServiceStub = jasmine.createSpyObj('AngularFirestore', [
    'doc',
    'collection'
  ]);
  angularFirestoreServiceStub.doc.and.returnValue({
    valueChanges: function() {
      return Observable.of({});
    }
  });

  beforeEach(async(() => {
    activatedRouteStub = new ActivatedRouteStub();
    activatedRouteStub.setParamMap({
      id: '201805'
    });
    accountServiceStub = jasmine.createSpyObj('AccountService', ['getAccounts', 'updateAccount']);
    accountServiceStub.getAccounts.and.returnValue(Observable.of([]));

    categoryServiceStub = jasmine.createSpyObj('CategoryService', [
      'getCategories',
      'updateCategory'
    ]);
    categoryServiceStub.getCategories.and.returnValue(Observable.of([]));

    matSnackBarStub = jasmine.createSpyObj('MatSnackBar', ['open']);

    TransactionServiceStub.getTransaction.and.returnValue(
      Observable.of({
        date: '2018-01-01',
        payee: 'Test Payee'
      })
    );
    UserServiceStub.getProfile$.and.returnValue(
      Observable.of({
        uid: '09876'
      })
    );
    BudgetServiceStub.getActiveBudget$.and.returnValue(
      Observable.of({
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
          useValue: TransactionServiceStub
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
    account.balance = 500;
    oldAccount.balance = 500;

    fixture.componentInstance.updateAccount(500, oldAccount, account);

    expect(accountServiceStub.updateAccount).toHaveBeenCalledTimes(2);
  });

  it('should update the old account and new selected account', () => {
    const fixture = TestBed.createComponent(TransactionComponent);
    const account = new Account();
    const oldAccount = new Account();
    account.balance = 500;
    oldAccount.balance = 500;

    fixture.componentInstance.updateAccount(500, oldAccount, account);

    expect(accountServiceStub.updateAccount).toHaveBeenCalledWith(
      jasmine.objectContaining({ balance: 0 })
    );
  });

  it('should update the old account and new selected account', () => {
    const fixture = TestBed.createComponent(TransactionComponent);
    const account = new Account();
    const oldAccount = new Account();

    account.balance = 1000;
    oldAccount.balance = 0;

    fixture.componentInstance.updateAccount(-500, oldAccount, account);

    expect(accountServiceStub.updateAccount).toHaveBeenCalledWith(
      jasmine.objectContaining({ balance: 500 })
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
      }),
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
});
