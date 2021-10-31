import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'app/shared/auth.service';
import dayjs from 'dayjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  templateUrl: 'login.component.html',
})
export class LoginComponent implements OnInit {
  email: string;
  password1: string;
  user: Observable<firebase.User>;
  errorMsg: any;
  form: FormGroup = this.fb.group({
    email: ['', Validators.required],
    password: ['', Validators.required]
  });

  constructor(private router: Router, private authService: AuthService, private fb: FormBuilder) {}

  ngOnInit() {}

  onLogin(): void {
    const loginEmail = this.form.get('email').value;
    const loginPassword = this.form.get('password').value;
    this.authService.login(loginEmail, loginPassword).subscribe(
      (res) => {
        const dateToUse = dayjs().format('YYYYMM');
        this.router.navigate([`/app/budget/${dateToUse}`]);
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
