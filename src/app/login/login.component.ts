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
  errorMsg: any;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {}

  onLogin(loginEmail: string, loginPassword: string): void {
    this.authService.login(loginEmail, loginPassword).subscribe(
      (res) => {
        this.user;
        this.router.navigate(['/app/budget/202109']);
      },

      (err) => {
        console.log(err);
        this.errorMsg = err.message;
      }
    );
  }

  signUp() {
    this.router.navigate(['/signup']);
  }

  cancel() {
    this.router.navigate(['/login']);
  }
}
