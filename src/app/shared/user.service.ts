import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
} from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IProfile } from '../shared/profile';
import { BudgetService } from '../budgets/budget.service';

@Injectable()
export class UserService implements CanActivate {
  authenticated = false;
  profile$: Observable<IProfile>;

  constructor(
    private router: Router,
    private afAuth: AngularFireAuth,
    private db: AngularFirestore
  ) {
    this.getProfile();
    this.verifyUser();
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const url: string = state.url;
    return this.verifyLogin(url);
  }

  verifyLogin(url: string): boolean {
    if (this.authenticated) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }

  register(email: string, password: string) {
    this.afAuth.auth
      .createUserWithEmailAndPassword(email, password)
      .then(user => {
        this.setupProfile(user);
      })
      .catch(function(error) {
        alert(`${error.message} Please try again!`);
      });
  }

  verifyUser() {
    return this.afAuth.authState;
  }

  login(loginEmail: string, loginPassword: string) {
    return this.afAuth.auth
      .signInWithEmailAndPassword(loginEmail, loginPassword)
      .then(user => {
        this.getProfile();
      });
  }

  logout() {
    this.authenticated = false;
    this.afAuth.auth.signOut().then(
      function() {
        alert(`Logged out!`);
      },
      function(error) {
        alert(`${error.message} Unable to logout. Try again!`);
      }
    );
  }

  getProfile(): Observable<IProfile> {
    return this.afAuth.authState.pipe(
      mergeMap(user => {
        return this.db.doc<IProfile>('users/' + user.uid).valueChanges();
      })
    );
  }

  /**
   * Sets up a profile and starter budget for a new user
   * @param  user User object
   * @return      [description]
   */
  setupProfile(user: any) {
    if (!user) {
      return;
    }
    const userStore = this.db.collection<any[]>('users');
    // create a new user document to store
    const userDoc = {
      name: user.displayName,
      availableBudgets: [],
      activeBudget: ''
    };

    userStore
      .doc(user.uid)
      .set(userDoc)
      .then(docRef => {
        // create a dummy budget to start with
        // this.budgetService.freshStart('default', user.uid);
      });
  }
}
