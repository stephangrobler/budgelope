import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../core/analytics.service';

@Component({
  templateUrl: 'home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  constructor(
    private _analytics: AnalyticsService
  ) {  }

  ngOnInit() {
    this._analytics.pageView('/');
  }
}
