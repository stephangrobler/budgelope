import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { UserService } from '../shared/user.service';
import { BudgetService } from '../budgets/budget.service';

@Component({
  templateUrl: 'login.component.html'
})
export class LoginComponent implements OnInit {
  email: string;
  password1: string;
  user: Observable<firebase.User>;

  constructor(
    private userSVC: UserService,
    private router: Router,
    public afAuth: AngularFireAuth,
    private budgetService: BudgetService
  ) {}

  ngOnInit() {
    if (this.userSVC.authenticated) {
      this.router.navigate(['/app/budget']);
    }
  }

  onLogin(loginEmail: string, loginPassword: string) {
    const router = this.router;
    this.userSVC
      .login(this.email, this.password1)
      .then(function(user) {
        router.navigate(['/app/budget']);
      })
      .catch(function(error) {
        alert(`${error.message} Unable to login. Try again.`);
      });
  }

  googleLogin() {
    this.afAuth.auth.signInWithPopup(new auth.GoogleAuthProvider()).then(user => {
      this.userSVC.getProfile$();
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
