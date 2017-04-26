import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from '../shared/user.service';


@Component({
  templateUrl: 'login.component.html',
})
export class LoginComponent implements OnInit {
  email: string;
  password1: string;

  constructor(private userSVC: UserService, private router: Router) {  }

  ngOnInit() {}

  login(loginEmail: string, loginPassword: string){
    this.userSVC.login(this.email, this.password1);
    this.userSVC.verifyUser();
  }

  cancel(){
    this.router.navigate(['/']);
  }
}
