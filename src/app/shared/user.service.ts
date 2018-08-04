import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { environment } from '../../environments/environment';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore } from 'angularfire2/firestore';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import * as firebase from 'firebase/app';

import { Account } from '../shared/account';
import { Profile } from '../shared/profile';
import { BudgetService } from '../budgets/budget.service';
import { CategoryService } from '../categories/category.service';

@Injectable()
export class UserService implements CanActivate {
  authenticated: boolean = false;
  authUser: firebase.User;
  profile$: Observable<Profile>;

  constructor(
    private router: Router,
    private afAuth: AngularFireAuth,
    private db: AngularFirestore,
    private categoryService: CategoryService,
    private budgetService: BudgetService
  ) {
    // firebase.initializeApp(environment.firebase);
    this.getProfile$();
    this.verifyUser();
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;
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
        console.log(user);
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
    return this.afAuth.auth.signInWithEmailAndPassword(loginEmail, loginPassword).then(() => {
      this.getProfile$();
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

  getProfile$(): Observable<Profile> {
    return this.afAuth.authState.pipe(
      mergeMap(user => {
        return this.db.doc<Profile>('users/' + user.uid).valueChanges();
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
    let userStore = this.db.collection<any[]>('users');
    // create a new user document to store
    let userDoc = {
      // name: user.
      name: user.displayName,
      availableBudgets: [],
      activeBudget: ''
    };

    userStore
      .doc(user.uid)
      .set(userDoc)
      .then(docRef => {
        // create a dummy budget to start with
        this.budgetService.freshStart('default', user.uid);
      });
    //
    // take to account screen to start new account
    // pPkN7QxRdyyvG4Jy2hr6
    // Exvs2cw8MFHfj4fi40Wn
  }
}
