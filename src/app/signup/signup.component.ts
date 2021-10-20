import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from '../shared/user.service';

@Component({
  templateUrl: 'signup.component.html',
})
export class SignUpComponent implements OnInit {
  email: string;
  password1: string;
  password2: string;
  passwordFail = false;

  constructor(private router: Router) {}

  ngOnInit() {}

  signUp() {
    if (this.password1 !== this.password2) {
      this.passwordFail = true;
    } else {
      this.passwordFail = false;
    }
  }

  cancel() {
    this.router.navigate(['/login']);
  }
}
