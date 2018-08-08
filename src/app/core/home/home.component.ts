import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnalyticsService } from '../analytics.service';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { AngularFireAuth } from 'angularfire2/auth';
import * as moment from 'moment';

@Component({
  templateUrl: 'home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  items: Observable<any[]>;
  accounts: Observable<Account[]>;
  currentMonth: string;

  constructor(
    private _analytics: AnalyticsService,
    private db: AngularFirestore,
    private router: Router,
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
  }

  ngOnInit() {
    this._analytics.pageView('/');
  }
}
