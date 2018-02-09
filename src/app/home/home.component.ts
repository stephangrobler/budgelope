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
  items : Observable<any[]>;

  constructor(
    private _analytics: AnalyticsService,
    db: AngularFirestore,
    private router: Router,
    afAuth: AngularFireAuth
  ) {

    afAuth.authState.subscribe((user) => {
      if (!user){
        return;
      } else {
        // this.router.navigate(['./budgetview']);
      }
    });
   }

  ngOnInit() {
    this._analytics.pageView('/');
  }
}
