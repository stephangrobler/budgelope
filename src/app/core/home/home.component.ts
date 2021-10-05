import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AnalyticsService } from '../analytics.service';
import { Observable, Subscription, of, Subject } from 'rxjs';
import * as moment from 'moment';
// import { ObservableMedia, MediaChange } from '@angular/flex-layout';
import { AccountService } from '../../accounts/account.service';
import { IAccount } from '../../shared/account';
import { takeUntil, map } from 'rxjs/operators';
import { UserService } from 'app/shared/user.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { AccountComponent } from '../../accounts/account/account.component';
import { AuthService } from 'app/shared/auth.service';
import { CategoryService } from 'app/categories/category.service';
import { PayeeService } from 'app/payees/payee.service';

@Component({
  templateUrl: 'home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  items: Observable<any[]>;
  accounts: Observable<IAccount[]>;
  currentMonth: string;
  sideNavState: any = {};
  watcher: Subscription;
  activeMediaQuery = '';
  theUser = true;
  isHandset = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(map((results) => results.matches));

  unsubscribe = new Subject<any>();
  loading: Observable<boolean>;

  constructor(
    private _analytics: AnalyticsService,
    private breakpointObserver: BreakpointObserver,
    private accountService: AccountService,
    private categoryService: CategoryService,
    private payeeService: PayeeService,
    public dialog: MatDialog,
    private auth: AuthService,
    private router: Router
  ) {
    this.accounts = this.accountService.entities$;
    this.loading = this.accountService.loading$;
  }

  ngOnInit() {
    this._analytics.pageView('/');
    this.currentMonth = moment().format('YYYYMM');
    this.auth.currentUser.subscribe((user) => {
      if (!user) return;

      this.accountService.getWithQuery({
        budget_id: user.active_budget_id,
      });
      this.categoryService.getWithQuery({ budget_id: user.active_budget_id });
      this.payeeService.getWithQuery({ budget_id: user.active_budget_id });
    });
  }

  ngOnDestroy() {
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }

  navigateTo(accountId) {
    this.router.navigate(['/app/transactions', { accountId: accountId }]);
  }

  gotoBudget() {
    // const shortDate = moment().format('YYYYMM');
    // this.router.navigate(['/app/budget/' + shortDate]);
  }

  onAddAccount() {
    const dialogRef = this.dialog.open(AccountComponent, {
      data: {
        accountId: 'add',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Account Dialog Result', result);
    });
  }
}
