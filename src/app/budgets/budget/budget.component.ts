import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Budget } from '../../shared/budget';
import { BudgetService } from '../budgetShared/budget.service';
import { UserService } from '../../shared/user.service';

@Component({
  selector: 'budget-form',
  templateUrl: 'budget.component.html',
})
export class BudgetComponent implements OnInit {
  budgetName: string;
  theUser: string;
  budget: Budget;

  constructor(
    private router: Router,
    private budgetService: BudgetService,
    private userService: UserService
  ) {  }

  ngOnInit() {
    this.theUser = this.userService.loggedInUser;
  }

  saveBudget(){
    this.budget = new Budget(
      this.budgetName,
      new Date(),
      this.theUser
    );
    this.budgetService.createBudget(this.budget);
  }

  cancel(){
    this.router.navigate(['/budgets']);
  }
}
