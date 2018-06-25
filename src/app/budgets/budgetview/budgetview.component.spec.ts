import { Component, Directive, NO_ERRORS_SCHEMA } from '@angular/core';
import { MatMenuModule } from '@angular/material';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BudgetviewComponent } from './budgetview.component';
import { BudgetService } from '../budget.service';
import { UserService } from '../../shared/user.service';
import { DragulaService } from 'ng2-dragula';
import { Router, ActivatedRoute } from '@angular/router';

import { ActivatedRouteStub } from '../../../testing/activate-route-stub';


describe('BudgetviewComponent', () => {
  let component: BudgetviewComponent;
  let fixture: ComponentFixture<BudgetviewComponent>;

  let angularFirestoreServiceStub: Partial<AngularFirestore>;
  let angularFireAuthServiceStub: Partial<AngularFireAuth>;
  let budgetServiceStub: Partial<BudgetService>;
  let userServiceStub: Partial<UserService>;
  let dragulaServiceStub: Partial<DragulaService>;
  let activatedRouteStub: ActivatedRouteStub;

  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(async(() => {
    activatedRouteStub = new ActivatedRouteStub();
    angularFireAuthServiceStub = jasmine.createSpyObj('AngularFireAuth', ['authState']);
    angularFirestoreServiceStub = jasmine.createSpyObj('AngularFirestore', ['doc', 'collection']);
    dragulaServiceStub = {};
    budgetServiceStub = {};
    userServiceStub = {};
    TestBed.configureTestingModule({
      imports: [
        MatMenuModule
      ],
      declarations: [
        BudgetviewComponent,
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {provide: AngularFirestore, useValue: angularFirestoreServiceStub },
        {provide: AngularFireAuth, useValue: angularFireAuthServiceStub },
        {provide: BudgetService, useValue: budgetServiceStub },
        {provide: UserService, useValue: userServiceStub },
        {provide: DragulaService, useValue: dragulaServiceStub },
        {provide: ActivatedRoute, useValue: activatedRouteStub },
        {provide: Router, useValue: routerSpy}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    activatedRouteStub.setParamMap({'month': '201805'});

    fixture = TestBed.createComponent(BudgetviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
