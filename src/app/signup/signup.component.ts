import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from '../core/user.service';

@Component({
  templateUrl: 'signup.component.html',
})
export class SignUpComponent implements OnInit {
  email: string;
  password1: string;
  password2: string;
  passwordFail: boolean = false;

  constructor(private userSVC: UserService, private router: Router) {  }

  ngOnInit() {}

  signUp(){
    if (this.password1 !== this.password2){
      this.passwordFail = true;
    } else {
      this.passwordFail = false;
      this.userSVC.register(this.email, this.password1);
      this.userSVC.verifyUser();
    }
  }

  cancel(){
    this.router.navigate(['/login']);
  }
}
