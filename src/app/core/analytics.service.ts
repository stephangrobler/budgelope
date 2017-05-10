import { Injectable } from '@angular/core';
import 'autotrack';

import 'autotrack/lib/plugins/event-tracker';
import 'autotrack/lib/plugins/outbound-link-tracker';
import 'autotrack/lib/plugins/url-change-tracker';

@Injectable()
export class AnalyticsService {

  constructor() {
        (window).ga=(window).ga||function(){((window).ga.q=(window).ga.q||[]).push(arguments)};(window).ga.l=+new Date;

        (window).ga('create', 'UA-98921558-1', 'auto');
        (window).ga('require', 'cleanUrlTracker');
        (window).ga('require', 'eventTracker');
        (window).ga('require', 'outboundLinkTracker');
        (window).ga('require', 'urlChangeTracker');
    }


    pageView(url: string) {
        (window).ga('set', 'page', url);
        (window).ga('send', 'pageview');
    }

    //to track clicks on html attributes
    //ga-on="click"

}
