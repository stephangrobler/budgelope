import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { TestBed, async } from '@angular/core/testing';
import { TransactionComponent } from './transaction.component';
import { TransactionService } from './../transaction.service';
import { BudgetService } from '../../budgets/budget.service';
import { UserService } from '../../shared/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { of } from 'rxjs';
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
import { TransactionClass } from '../../shared/transaction';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('TransactionComponent', () => {
  let transactionServiceStub;

  const BudgetServiceStub = jasmine.createSpyObj('BudgetService', [
    'getTransactions',
    'getActiveBudget'
  ]);
  const UserServiceStub = jasmine.createSpyObj('UserService', [
    'getUser',
    'getProfile'
  ]);
  const RouterStub = jasmine.createSpyObj('Router', ['navigate']);
  let accountServiceStub,
    categoryServiceStub,
    matSnackBarStub,
    activatedRouteStub;
  const angularFireAuthServiceStub = jasmine.createSpyObj('AngularFireAuth', [
    'authenticate'
  ]);
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
      'getAll',
      'getWithQuery',
      'getByKey',
      'createTransaction',
      'removeTransaction',
      'calculateAmount'
    ]);
    transactionServiceStub.getAll.and.returnValue(of([]));
    transactionServiceStub.getWithQuery.and.returnValue(of([]));
    transactionServiceStub.createTransaction.and.returnValue(Promise.resolve());
    transactionServiceStub.removeTransaction.and.returnValue({
      then: (success, failure) => {
        success();
      }
    });
    accountServiceStub = jasmine.createSpyObj('AccountService', [
      'getAll',
      'updateAccountBalance'
    ]);
    accountServiceStub.getAll.and.returnValue(of([]));
    accountServiceStub.updateAccountBalance.and.returnValue(of({}));

    categoryServiceStub = jasmine.createSpyObj('CategoryService', [
      'getWithQuery',
      'update'
    ]);
    categoryServiceStub.getWithQuery.and.returnValue(of([]));
    categoryServiceStub.update.and.returnValue(of({}));

    matSnackBarStub = jasmine.createSpyObj('MatSnackBar', ['open']);

    transactionServiceStub.getByKey.and.returnValue(
      of({
        date: '2018-01-01',
        payee: 'Test Payee',
        categories: [
          { categoryId: 'test', category: 'test cat name', in: 0, out: 500 }
        ]
      })
    );
    UserServiceStub.getProfile.and.returnValue(
      of({
        uid: '09876',
        activeBudget: '54321'
      })
    );
    BudgetServiceStub.getActiveBudget.and.returnValue(
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
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
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

  it('should display an additional account drop down if type is transfer', () => {
    const fixture = TestBed.createComponent(TransactionComponent);
    fixture.detectChanges();
    const comp = fixture.debugElement.componentInstance;
  });

  it('should call the transfer function', (done: DoneFn) => {
    categoryServiceStub.getWithQuery.and.returnValue(
      of([
        { id: 'cat1', name: 'Transfer In', type: 'system' },
        { id: 'cat2', name: 'Transfer Out', type: 'system' }
      ])
    );

    const fixture = TestBed.createComponent(TransactionComponent);
    fixture.detectChanges();
    const comp = fixture.debugElement.componentInstance;
    const form = fixture.componentInstance.transactionForm;

    form.get('account').setValue({ id: 'acc1', name: 'acc1Name' });
    form
      .get('transferAccount')
      .setValue({ id: 'acc2', name: 'Test Account 2' });
    form.get('transferAmount').setValue(500);
    form.get('transfer').setValue(true);

    comp.transfer(form).then(results => {
      expect(transactionServiceStub.createTransaction).toHaveBeenCalledTimes(2);
      done();
    });
  });

  it('should call the transfer function with a to Transaction of values', (done: DoneFn) => {

    const fixture = TestBed.createComponent(TransactionComponent);
    fixture.detectChanges();
    const comp = fixture.debugElement.componentInstance;
    const form = fixture.componentInstance.transactionForm;
    form.get('account').setValue({ id: 'acc1', name: 'acc1Name' });
    form
      .get('transferAccount')
      .setValue({ id: 'acc2', name: 'Test Account 2' });
    form.get('transferAmount').setValue(500);
    form.get('transfer').setValue(true);

    comp.transfer(form).then(() => {
      expect(transactionServiceStub.createTransaction).toHaveBeenCalledWith(
        jasmine.objectContaining({
          account: { id: 'acc2', name: 'Test Account 2' },
          payee: 'Transfer from acc1Name',
          amount: 500
        }),
        '54321'
      );
      done();
    });
  });

  it('should call the transfer function with a from Transaction of values', (done: DoneFn) => {
    const fixture = TestBed.createComponent(TransactionComponent);
    fixture.detectChanges();
    const comp = fixture.debugElement.componentInstance;
    const form = fixture.componentInstance.transactionForm;
    form.get('account').setValue({ id: 'acc1', name: 'acc1Name' });
    form
      .get('transferAccount')
      .setValue({ id: 'acc2', name: 'Test Account 2' });
    form.get('transferAmount').setValue(500);
    form.get('transfer').setValue(true);


    comp.transfer(form).then(() => {
      expect(transactionServiceStub.createTransaction).toHaveBeenCalledWith(
        jasmine.objectContaining({
          account: { id: 'acc1', name: 'acc1Name' },
          payee: 'Transfer to Test Account 2',
          amount: -500
        }),
        '54321'
      );
      done();
    });
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
      .setValue([
        { category: { id: 'cat1', name: 'cat1Name' }, in: 0, out: 500 }
      ]);

    // action
    comp.create(comp.transactionForm);

    // assert
    expect(transactionServiceStub.createTransaction).toHaveBeenCalledWith(
      jasmine.objectContaining({ amount: 500 }),
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
      .setValue([
        { category: { id: 'cat1', name: 'cat1Name' }, in: 0, out: 500 }
      ]);
    spyOn(window, 'confirm').and.returnValue(true);
    // action
    comp.onDelete();

    // assert
    expect(transactionServiceStub.removeTransaction).toHaveBeenCalledWith(
      '54321',
      '12345'
    );
  });
});
