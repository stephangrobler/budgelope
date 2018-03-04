import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { UserService } from '../core/user.service';
import { MatGridListModule, MatButtonModule } from '@angular/material';


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

  }

  ngOnInit() {

  }

  login(loginEmail: string, loginPassword: string){
    this.userSVC.login(this.email, this.password1);
  }

  googleLogin() {
    this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then((user) => {

      this.router.navigate(['/app/budget']);
    });
  }

  signUp(){
    this.router.navigate(['/signup']);
  }

  cancel(){
    this.router.navigate(['/login']);
  }
}
