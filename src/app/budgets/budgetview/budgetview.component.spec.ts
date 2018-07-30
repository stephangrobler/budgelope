import {
  Component,
  Directive,
  NO_ERRORS_SCHEMA,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import {
  MatMenuModule,
  MatTableModule
} from '@angular/material';
import {
  AngularFirestore
} from 'angularfire2/firestore';
import {
  AngularFireAuth
} from 'angularfire2/auth';
import {
  async,
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import {
  BudgetviewComponent
} from './budgetview.component';
import {
  BudgetService
} from '../budget.service';
import {
  UserService
} from '../../shared/user.service';
import {
  DragulaService
} from 'ng2-dragula';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import {
  Observable
} from 'rxjs/Observable';

import {
  ActivatedRouteStub
} from '../../../testing/activate-route-stub';


describe('BudgetviewComponent', () => {
  let component: BudgetviewComponent;
  let fixture: ComponentFixture < BudgetviewComponent > ;

  let budgetServiceStub: Partial < BudgetService > ;
  let userServiceStub: Partial < UserService > ;
  let dragulaServiceStub;
  let activatedRouteStub: ActivatedRouteStub;
  let angularFirestoreServiceStub;
  let angularFireAuthServiceStub;

  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(async (() => {
    activatedRouteStub = new ActivatedRouteStub();
    activatedRouteStub.setParamMap({
      'month': '201805'
    });

    angularFireAuthServiceStub = jasmine.createSpyObj('AngularFireAuth', ['authenticate']);
    angularFireAuthServiceStub.authState = Observable.of({
      uid: '12345'
    });

    angularFirestoreServiceStub = jasmine.createSpyObj('AngularFirestore', ['doc', 'collection']);
    angularFirestoreServiceStub.doc.and.returnValue({
      'valueChanges': function () {
        return Observable.of({})
      }
    });

    dragulaServiceStub = jasmine.createSpyObj('DragulaService', ['setOptions', 'find']);
    dragulaServiceStub.dropModel = Observable.of({});

    budgetServiceStub = {};
    userServiceStub = {};
    TestBed.configureTestingModule({
        imports: [
          MatMenuModule
        ],
        declarations: [
          BudgetviewComponent,
        ],
        schemas: [NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
        providers: [{
            provide: AngularFirestore,
            useValue: angularFirestoreServiceStub
          },
          {
            provide: AngularFireAuth,
            useValue: angularFireAuthServiceStub
          },
          {
            provide: BudgetService,
            useValue: budgetServiceStub
          },
          {
            provide: UserService,
            useValue: userServiceStub
          },
          {
            provide: DragulaService,
            useValue: dragulaServiceStub
          },
          {
            provide: ActivatedRoute,
            useValue: activatedRouteStub
          },
          {
            provide: Router,
            useValue: routerSpy
          }
        ]
      })
      .compileComponents();
  }));

  beforeEach(() => {
    angularFirestoreServiceStub.doc.and.callFake(function (args) {
      if (args === 'users/12345') {
        return {
          'valueChanges': function () {
            return Observable.of({
              activeBudget: '67890'
            });
          }
        };
      } else if (args === 'budgets/67890') {
        return {
          'valueChanges': function () {
            return Observable.of({
              allocations: []
            });
          }
        }
      }
    });

    angularFirestoreServiceStub.collection.and.returnValue({
      snapshotChanges: function() {
        return Observable.of([]);
      }
    });

    fixture = TestBed.createComponent(BudgetviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create a component', () => {
    expect(component).toBeTruthy();
  });
});
