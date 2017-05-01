import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from './user.service';


@Component({
  selector: 'navi-bar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavComponent implements OnInit {
  theUser: string;

  constructor( private userService: UserService, private router: Router){}

  ngOnInit(){
    this.userService.verifyUser();
    this.theUser = this.userService.loggedInUser;
  }


}
