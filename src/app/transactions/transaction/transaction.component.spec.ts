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
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AccountService } from '../../accounts/account.service';
import { Account } from '../../shared/account';
import { CategoryService } from '../../categories/category.service';


import { ActivatedRouteStub } from '../../../testing/activate-route-stub';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('TransactionsComponent', () => {
  const TransactionServiceStub = jasmine.createSpyObj('TransactionService', ['getTransactions', 'getTransaction']);
  TransactionServiceStub.getTransactions.and.returnValue(Observable.of([]));

  const BudgetServiceStub = jasmine.createSpyObj('BudgetService', ['getTransactions', 'getActiveBudget$']);
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
    accountServiceStub = jasmine.createSpyObj('AccountService', ['getAccounts']);
    accountServiceStub.getAccounts.and.returnValue(Observable.of([]));

    categoryServiceStub = jasmine.createSpyObj('CategoryService', ['getCategories']);
    categoryServiceStub.getCategories.and.returnValue(Observable.of([]));

    matSnackBarStub = jasmine.createSpyObj('MatSnackBar', ['open']);

    TransactionServiceStub.getTransaction.and.returnValue(Observable.of({
        date: '2018-01-01',
        payee: 'Test Payee'
    }));
    UserServiceStub.getProfile$.and.returnValue(Observable.of({
        uid: '09876'
    }));
    BudgetServiceStub.getActiveBudget$.and.returnValue(Observable.of({
        id: '54321'
    }));

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

});
