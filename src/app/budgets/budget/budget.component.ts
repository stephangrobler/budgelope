import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';

import { Budget } from '../../shared/budget';
import { BudgetService } from '../budgetShared/budget.service';
import { UserService } from '../../shared/user.service';

@Component({
  selector: 'budget-form',
  templateUrl: 'budget.component.html',
})
export class BudgetComponent implements OnInit {
  budgetName: string;
  theUserId: string;
  budget: Budget;

  constructor(
    private router: Router,
    private budgetService: BudgetService,
    private userService: UserService
  ) {  }

  ngOnInit() {
    this.theUserId = this.userService.authUser.uid;
  }

  saveBudget(){
    this.budget = new Budget(
      this.budgetName,
      new Date(),
      false,
      this.theUserId
    );
    this.budgetService.createBudget(this.budget);
  }

  cancel(){
    this.router.navigate(['/budgets']);
  }
}
