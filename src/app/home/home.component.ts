import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AnalyticsService } from '../core/analytics.service';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';

@Component({
  templateUrl: 'home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  items: Observable<any[]>;
  accounts: Observable<Account[]>;

  constructor(
    private _analytics: AnalyticsService,
    private db: AngularFirestore,
    private router: Router,
    afAuth: AngularFireAuth
  ) {

    afAuth.authState.subscribe((user) => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      } else {
        // this.router.navigate(['./budgetview']);
        let profile = this.db.doc<any>('users/' + user.uid).valueChanges().subscribe(profile => {
          // get accounts
          this.accounts = this.db.collection<any>('budgets/' + profile.activeBudget + '/accounts').valueChanges();
          
        });
      }
    });
  }

  ngOnInit() {
    this._analytics.pageView('/');
  }
}
