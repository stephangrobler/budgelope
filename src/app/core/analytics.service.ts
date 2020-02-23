import { Injectable } from '@angular/core';
import 'autotrack';

import 'autotrack/lib/plugins/event-tracker';
import 'autotrack/lib/plugins/outbound-link-tracker';
import 'autotrack/lib/plugins/url-change-tracker';
declare let ga: Function;

@Injectable()
export class AnalyticsService {

  constructor() {
        ga('create', 'UA-98921558-1', 'auto');
        ga('require', 'cleanUrlTracker');
        ga('require', 'eventTracker');
        ga('require', 'outboundLinkTracker');
        ga('require', 'urlChangeTracker');
    }

    pageView(url: string) {
        ga('set', 'page', url);
        ga('send', 'pageview');
    }

}
