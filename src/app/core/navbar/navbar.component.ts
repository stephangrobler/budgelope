import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import * as moment from 'moment';

import { UserService } from '../../shared/user.service';
import { BudgetService } from '../../budgets/budget.service';
import { Budget } from '../../shared/budget';


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
    this.userService.verifyUser().subscribe(user => {
      this.theUser = user;
    });
  }

  logout() {
    this.userService.logout();
  }

  gotoBudget() {
    let shortDate = moment().format('YYYYMM');
    this.router.navigate(['/app/budget/'+ shortDate]);
  }
}
