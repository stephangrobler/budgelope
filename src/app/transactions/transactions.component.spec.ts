import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { TestBed, async } from '@angular/core/testing';
import { TransactionsComponent } from './transactions.component';
import { TransactionService } from './transaction.service';
import { BudgetService } from '../budgets/budget.service';
import { UserService } from '../shared/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { ActivatedRouteStub } from 'testing/activate-route-stub';

describe('TransactionsComponent', () => {
  let activatedRouteStub;

  const TransactionServiceStub = jasmine.createSpyObj('TransactionService', ['getWithQuery', 'getByKey']);
  TransactionServiceStub.getWithQuery.and.returnValue(of([]));

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

  const matDialogStub = jasmine.createSpyObj('MatDialog', ['open', 'afterClosed']);
  

  beforeEach(async (() => {
    activatedRouteStub = new ActivatedRouteStub();
    activatedRouteStub.setParamMap({});

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
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub
        },
        {
          provide: MatDialog,
          useValue: matDialogStub
        }
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
