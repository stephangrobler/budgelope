import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth';
import { Observable } from 'rxjs/Rx';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';

@Injectable()
export class AuthGuardService implements CanActivate{

  constructor(private auth: AngularFireAuth, private router: Router) { }

  canActivate(): Observable<boolean>{
    let router = this.router;
    return this.auth.authState
    .take(1)
    .map(state => !!state)
    .do(authenticated => {
      console.log(authenticated);
      if (!authenticated) {
        console.log('not logged in, redirecting...');
        console.log(this.router.config);
        this.router.navigate['../login'];
      }
    });
  }

}
