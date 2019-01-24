import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AnalyticsService } from '../analytics.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, Subscription, of, Subject } from 'rxjs';
import * as moment from 'moment';
import { ObservableMedia, MediaChange } from '@angular/flex-layout';
import { AccountService } from '../../accounts/account.service';
import { Account } from '../../shared/account';
import { AuthService } from 'app/shared/auth.service';
import { takeUntil } from 'rxjs/operators';
import { UserService } from 'app/shared/user.service';

@Component({
  templateUrl: 'home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  items: Observable<any[]>;
  accounts: Observable<Account[]>;
  currentMonth: string;
  sideNavState: any = {};
  watcher: Subscription;
  activeMediaQuery = '';
  theUser = true;

  unsubscribe = new Subject<any>();

  constructor(
    private _analytics: AnalyticsService,
    private db: AngularFirestore,
    private router: Router,
    private media: ObservableMedia,
    private authService: AuthService,
    private accountService: AccountService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this._analytics.pageView('/');
    this.currentMonth = moment().format('YYYYMM');
    this.userService
      .getProfile$()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(profile => {
          this.accounts = this.accountService.getAccounts(profile.activeBudget);
      });

    this.media
      .asObservable()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe((change: MediaChange) => {
        this.activeMediaQuery = change ? `'${change.mqAlias}' = (${change.mediaQuery})` : '';
        if (change.mqAlias === 'xs') {
          this.sideNavState.mode = 'over';
          this.sideNavState.opened = false;
        } else {
          this.sideNavState.mode = 'side';
          this.sideNavState.opened = true;
        }
      });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  navigateTo(accountId) {
    this.router.navigate(['/app/transactions', { accountId: accountId }]);
  }
}
