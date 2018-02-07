import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../core/analytics.service';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

@Component({
  templateUrl: 'home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  items : Observable<any[]>;

  constructor(
    private _analytics: AnalyticsService,
    db: AngularFirestore
  ) {
    this.items = db.collection('budgets').valueChanges();
    console.log(this.items);
   }

  ngOnInit() {
    this._analytics.pageView('/');
  }
}
