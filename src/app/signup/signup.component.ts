import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from '../shared/user.service';

@Component({
  selector: 'selector',
  templateUrl: 'sign-up.component.html',
})
export class SignUpComponent implements OnInit {
  email: string;
  password1: string;
  password2: string;
  passwordFail: boolean = false;

  constructor(private userService: UserService, private router: Router) {  }

  ngOnInit() {}

  signUp(){
    if (this.password1 !== this.password2){
      this.passwordFail = true;
    } else {
      this.passwordFail = false;
      this.userService.register(this.email, this.password1);
      this.userService.verifyUser();
    }
  }

  cancel(){
    this.router.navigate(['/login']);
  }
}
