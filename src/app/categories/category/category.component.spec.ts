import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatTableModule, MatCardModule, MatRadioModule, MatSelectModule, MatFormFieldModule, MatInputModule } from '@angular/material';
import { TestBed, async } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CategoryComponent } from './category.component';
import { CategoryService } from './../category.service';
import { BudgetService } from '../../budgets/budget.service';
import { UserService } from '../../shared/user.service';
import { Router } from '@angular/router';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable, of } from 'rxjs';
import { ActivatedRouteStub } from '../../../testing/activate-route-stub';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('categoryComponent', () => {
  let activatedRouteStub;
  const CategoryServiceStub = jasmine.createSpyObj('CategoryService', ['getCategory']);
  CategoryServiceStub.getCategory.and.returnValue(of([]));

  const BudgetServiceStub = jasmine.createSpyObj('BudgetService', ['getTransactions']);
  const UserServiceStub = jasmine.createSpyObj('UserService', ['getUser']);
  const routerStub = jasmine.createSpyObj('Router', ['navigate']);


  const angularFirestoreServiceStub = jasmine.createSpyObj('AngularFirestore', ['doc', 'collection']);
  angularFirestoreServiceStub.doc.and.returnValue({
    'valueChanges': function () {
      return of({})
    }
  });

  // mock collection to return array
  angularFirestoreServiceStub.collection.and.returnValue({
    snapshotChanges: () => {return of([])}
  });

  beforeEach(async (() => {
    activatedRouteStub = new ActivatedRouteStub();

  const angularFireAuthServiceStub = jasmine.createSpyObj('AngularFireAuth', ['authenticate']);
  angularFireAuthServiceStub.authState = of({
    uid: '123456'
  });

    TestBed.configureTestingModule({
      declarations: [
        CategoryComponent
      ],
      imports: [
        MatTableModule,
        MatRadioModule,
        MatSelectModule,
        MatInputModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule
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
          provide: CategoryService,
          useValue: CategoryServiceStub
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
          useValue: routerStub
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub
        }
      ]
    }).compileComponents();
  }));

  it('should create the app', async (() => {
    const fixture = TestBed.createComponent(CategoryComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it(`should have as title 'category'`, async (() => {
    const fixture = TestBed.createComponent(CategoryComponent);
    const app = fixture.debugElement.componentInstance;

    expect(app.title).toEqual('Category');
  }));

  it('should render title in a h1 tag', async (() => {
    const fixture = TestBed.createComponent(CategoryComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Category');
  }));

  it('should navigate back to the budget if cancelled', () => {
    const fixture = TestBed.createComponent(CategoryComponent);

    fixture.componentInstance.cancel();

    expect(routerStub.navigate).toHaveBeenCalled();
  })
});
