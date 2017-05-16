import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

import { UserService } from '../shared/user.service';


@Component({
  templateUrl: 'login.component.html',
})
export class LoginComponent implements OnInit {
  email: string;
  password1: string;
  user: Observable<firebase.User>;

  constructor(
    private userSVC: UserService,
    private router: Router,
    public afAuth: AngularFireAuth
  ) {
    this.user = afAuth.authState;
  }

  ngOnInit() {}

  login(loginEmail: string, loginPassword: string){
    this.userSVC.login(this.email, this.password1);
    this.userSVC.verifyUser();
  }

  googleLogin() {
    this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then((user) => {
      console.log(user.user.providerData[0]);
      
      this.router.navigate(['/']);
    });
  }

  signUp(){
    this.router.navigate(['/signup']);
  }

  cancel(){
    this.router.navigate(['/']);
  }
}
