import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Budget } from '../../shared/budget';

@Component({
  selector: 'budget-form',
  templateUrl: 'budget.component.html',
})
export class BudgetComponent implements OnInit {
  budgetName: string;

  budget: Budget;

  constructor(private router: Router) {  }

  ngOnInit() {}
}
