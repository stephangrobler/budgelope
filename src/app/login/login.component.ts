import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { UserService } from '../shared/user.service';
import { BudgetService } from '../budgets/budget.service';
import { AuthService } from 'app/shared/auth.service';

@Component({
  templateUrl: 'login.component.html',
})
export class LoginComponent implements OnInit {
  email: string;
  password1: string;
  user: Observable<firebase.User>;

  constructor(
    private router: Router,
    public afAuth: AngularFireAuth,
    private authService: AuthService
  ) {}

  ngOnInit() {
    if (this.authService.authenticated) {
      this.router.navigate(['/app/budget']);
    }
  }

  onLogin(loginEmail: string, loginPassword: string): void {
    this.afAuth
      .signInWithEmailAndPassword(loginEmail, loginPassword)
      .then((user) => {
        this.router.navigate(['/app/budget']);
      })
      .catch((error) => {
        alert(`${error.message} Unable to login. Try again.`);
      });
  }

  googleLogin() {
    this.afAuth.signInWithPopup(new auth.GoogleAuthProvider()).then((user) => {
      // check if the user has a profile
      this.router.navigate(['/app/budget']);
    });
  }

  signUp() {
    this.router.navigate(['/signup']);
  }

  cancel() {
    this.router.navigate(['/login']);
  }
}
