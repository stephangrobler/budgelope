import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import * as moment from 'moment';

import { UserService } from '../core/user.service';
import { BudgetService } from '../core/budget.service';
import { Budget } from './budget';


@Component({
  selector: 'navi-bar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavComponent implements OnInit {
  theUser: firebase.User;
  theBudget: Budget;
  budgets: Budget[];

  constructor(
    private userService: UserService,
    private budgetService: BudgetService,
    private router: Router
  ) { }

  ngOnInit() {
    this.userService.verifyUser();
    this.theUser = this.userService.authUser;

    // check to see if the user is authenticated
    // firebase.auth().onAuthStateChanged((user) => {
    //   if (user) {
    //     this.theBudget = this.budgetService.getActiveBudget();
    //     this.userService.verifyUser();
    //     this.theUser = this.userService.loggedInUser;
    //   }
    // });
  }

  logout() {
    this.userService.logout();
  }

  gotoBudget() {
    let shortDate = moment().format('YYYYMM');
    this.router.navigate(['/app/budget/'+ shortDate]);
  }



}
