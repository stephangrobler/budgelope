import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';

import { TestBed, async } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLinkDirectiveStub } from 'testing/route-link-directive-stub';
import { AnalyticsService } from '../analytics.service';
import { of } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import * as moment from 'moment';
// import { ObservableMedia } from '@angular/flex-layout';
import { AccountService } from '../../accounts/account.service';
import { UserService } from 'app/shared/user.service';
import { BreakpointObserver } from '@angular/cdk/layout';

@Component({ selector: 'router-outlet', template: '' })
class RouterOutletStubComponent {}

@Component({ selector: 'navi-bar', template: '' })
class NavigationBarStubComponent {}

describe('HomeComponent', () => {
  let analyticsServiceStub, dbStub, routerStub, authStub, breakpointObserverStub, accountServiceStub, userServiceStub;

  beforeEach(async(() => {
    analyticsServiceStub = jasmine.createSpyObj('AnalyticsService', ['pageView']);
    dbStub = jasmine.createSpyObj('AngularFirestore', ['doc', 'collection']);
    dbStub.doc.and.returnValue({
      valueChanges: () => of({ activeBudget: 'abcde' })
    });
    dbStub.collection.and.returnValue({
      valueChanges: () => of([])
    });
    routerStub = jasmine.createSpyObj('Router', ['navigate']);
    authStub = jasmine.createSpyObj('AngularFireAuth', ['login']);
    authStub.authState = of({ uid: '12345' });
    breakpointObserverStub = { observe: () => of({})};
    accountServiceStub = jasmine.createSpyObj('AccountService', ['getAccounts']);
    userServiceStub = jasmine.createSpyObj('UserService', ['getProfile$']);
    userServiceStub.getProfile$.and.returnValue(of({activeBudget: 'abcde'}))

    TestBed.configureTestingModule({
      declarations: [
        HomeComponent,
        RouterOutletStubComponent,
        NavigationBarStubComponent,
        RouterLinkDirectiveStub
      ],
      imports: [
        MatSidenavModule,
        MatListModule,
        MatIconModule,
        MatToolbarModule,
        BrowserAnimationsModule
      ],
      schemas: [],
      providers: [
        {
          provide: AnalyticsService,
          useValue: analyticsServiceStub
        },
        {
          provide: AngularFirestore,
          useValue: dbStub
        },
        {
          provide: Router,
          useValue: routerStub
        },
        {
          provide: AngularFireAuth,
          useValue: authStub
        },
        {
          provide: BreakpointObserver,
          useValue: breakpointObserverStub
        },
        {
          provide: AccountService,
          useValue: accountServiceStub
        },
        {
          provide: UserService,
          useValue: userServiceStub
        }
      ]
    }).compileComponents();
  }));

  it('should create the component', async(() => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it('should call the pageView for the analytics', async(() => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const app = fixture.debugElement.componentInstance;
    expect(analyticsServiceStub.pageView).toHaveBeenCalled();
  }));

  it('should have the current month set on the component', async(() => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const app = fixture.debugElement.componentInstance;
    expect(app.currentMonth).toBe(moment().format('YYYYMM'));
  }));

  it('should call the accounts for the user', async(() => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const app = fixture.debugElement.componentInstance;
    expect(accountServiceStub.getAccounts).toHaveBeenCalledWith('abcde');
  }));
});
