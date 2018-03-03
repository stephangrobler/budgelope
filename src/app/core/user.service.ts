import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { environment } from '../../environments/environment';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import { Account } from '../shared/account';

@Injectable()
export class UserService implements CanActivate {
  userLoggedIn: boolean = false;
  loggedInUser: any;
  authUser: any;


  constructor(private router: Router, private afAuth: AngularFireAuth) {
    // firebase.initializeApp(environment.firebase);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;
    return this.verifyLogin(url);
  }

  verifyLogin(url: string): boolean {
    if (this.userLoggedIn) { return true; }

    this.router.navigate(['/login']);
    return false;
  }

  register(email: string, password: string) {
    this.afAuth.auth.createUserWithEmailAndPassword(email, password).then((user) => {
      this.setupProfile(user.uid);
    })
      .catch(function(error) {
        alert(`${error.message} Please try again!`);
      });
  }

  verifyUser() {
    this.afAuth.authState.subscribe(user => {
      this.loggedInUser = user;
      this.userLoggedIn = true;
    });
  }

  login(loginEmail: string, loginPassword: string) {
    this.afAuth.auth.signInWithEmailAndPassword(loginEmail, loginPassword)
      .catch(function(error) {
        alert(`${error.message} Unable to login. Try again.`);
      })
  }

  logout() {
    this.userLoggedIn = false;
    this.afAuth.auth.signOut().then(function() {
      alert(`Logged out!`);
    }, function(error) {
      alert(`${error.message} Unable to logout. Try again!`);
    });
  }

  getProfile(uid: string){

  }

  setupProfile(uid: string) {
    if (!uid){
      return;
    }
  }

}
