import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatTableModule, MatCardModule } from '@angular/material';
import { TestBed, async } from '@angular/core/testing';
import { TransactionsComponent } from './transactions.component';
import { TransactionService } from './transaction.service';
import { BudgetService } from '../budgets/budget.service';
import { UserService } from '../shared/user.service';
import { Router } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable, of } from 'rxjs';

describe('TransactionsComponent', () => {

  const TransactionServiceStub = jasmine.createSpyObj('TransactionService', ['getTransactions']);
  TransactionServiceStub.getTransactions.and.returnValue(of([]));

  const BudgetServiceStub = jasmine.createSpyObj('BudgetService', ['getTransactions']);
  const UserServiceStub = jasmine.createSpyObj('UserService', ['getUser']);
  const RouterStub = jasmine.createSpyObj('Router', ['navigate']);

  const angularFireAuthServiceStub = jasmine.createSpyObj('AngularFireAuth', ['authenticate']);
  angularFireAuthServiceStub.authState = of([]);

  const angularFirestoreServiceStub = jasmine.createSpyObj('AngularFirestore', ['doc', 'collection']);
  angularFirestoreServiceStub.doc.and.returnValue({
    'valueChanges': function () {
      return of({})
    }
  });

  beforeEach(async (() => {
    TestBed.configureTestingModule({
      declarations: [
        TransactionsComponent
      ],
      imports: [
        MatTableModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{
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
      ]
    }).compileComponents();
  }));

  it('should create the app', async (() => {
    const fixture = TestBed.createComponent(TransactionsComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it(`should have as title 'Transactions'`, async (() => {
    const fixture = TestBed.createComponent(TransactionsComponent);
    const app = fixture.debugElement.componentInstance;

    expect(app.title).toEqual('Transactions');
  }));

  it('should render title in a h1 tag', async (() => {
    const fixture = TestBed.createComponent(TransactionsComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Transactions');
  }));
});
