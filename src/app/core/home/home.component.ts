import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AnalyticsService } from '../analytics.service';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable, Subscription } from 'rxjs';
import { AngularFireAuth } from 'angularfire2/auth';
import * as moment from 'moment';
import { ObservableMedia, MediaChange } from '@angular/flex-layout';

@Component({
  templateUrl: 'home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  items: Observable<any[]>;
  accounts: Observable<Account[]>;
  currentMonth: string;
  sideNavState: any= {};
  watcher: Subscription;
  activeMediaQuery = '';

  constructor(
    private _analytics: AnalyticsService,
    private db: AngularFirestore,
    private router: Router,
    private media: ObservableMedia,
    afAuth: AngularFireAuth
  ) {
    this.currentMonth = moment().format('YYYYMM');
    afAuth.authState.subscribe(user => {
      if (!user) {
        this.router.navigate(['./login']);
        return;
      } else {
        // this.router.navigate(['./app/budget']);
        this.db
          .doc<any>('users/' + user.uid)
          .valueChanges()
          .subscribe(profile => {
            // get accounts
            this.accounts = this.db
              .collection<any>('budgets/' + profile.activeBudget + '/accounts')
              .valueChanges();
          });
      }
    });

    this.watcher = media.subscribe((change: MediaChange) => {
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

  ngOnInit() {
    this._analytics.pageView('/');
  }

  ngOnDestroy() {
    this.watcher.unsubscribe();
  }
}
