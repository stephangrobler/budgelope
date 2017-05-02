import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';

import { UserService } from './user.service';
import { BudgetService } from '../core/budget.service';
import { Budget } from './budget';


@Component({
  selector: 'navi-bar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})

export class NavComponent implements OnInit {
  theUser: string;
  theBudget: Budget;
  budgets: Budget[];

  constructor(
    private userService: UserService,
    private budgetService: BudgetService,
    private router: Router
  ) { }

  ngOnInit() {
    this.theUser = this.userService.loggedInUser;
    firebase.auth().onAuthStateChanged((user) => {
      console.log('auth changes', user);
      this.theBudget = this.budgetService.getActiveBudget();
      this.userService.verifyUser();
      this.theUser = this.userService.loggedInUser;
    });
  }





}
