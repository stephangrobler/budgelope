import { NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';

import { TestBed, async } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { MatSidenavModule, MatListModule } from '@angular/material';
import { RouterLinkDirectiveStub } from 'testing/route-link-directive-stub';
import { AnalyticsService } from '../analytics.service';
import { of } from 'rxjs';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { Router } from '@angular/router';
import { BrowserAnimationsModule } from '../../../../node_modules/@angular/platform-browser/animations';

@Component({ selector: 'router-outlet', template: '' })
class RouterOutletStubComponent {}

@Component({ selector: 'navi-bar', template: '' })
class NavigationBarStubComponent {}

describe('HomeComponent', () => {
  let analyticsServiceStub, dbStub, routerStub, authStub;

  beforeEach(async(() => {
    analyticsServiceStub = jasmine.createSpyObj('AnalyticsService', ['pageView']);
    dbStub = jasmine.createSpyObj('AngularFirestore', ['doc', 'collection']);
    dbStub.doc.and.returnValue({
        valueChanges: () => of({})
    });
    dbStub.collection.and.returnValue({
        valueChanges: () => of([])
    });
    routerStub = jasmine.createSpyObj('Router', ['navigate']);
    authStub = jasmine.createSpyObj('AngularFireAuth', ['login']);
    authStub.authState = of({ uid: '12345' });

    TestBed.configureTestingModule({
      declarations: [
        HomeComponent,
        RouterOutletStubComponent,
        NavigationBarStubComponent,
        RouterLinkDirectiveStub
      ],
      imports: [MatSidenavModule, MatListModule, BrowserAnimationsModule],
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
});
