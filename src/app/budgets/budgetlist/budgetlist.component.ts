import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/user.service';


@Component({
  selector: 'budget-list',
  templateUrl: 'budgetlist.component.html',
})
export class BudgetListComponent implements OnInit {
  theUserId: string;
  budgets: any[];

  constructor(private userService: UserService) {  }

  ngOnInit() {
    this.getBudgets();
  }

  getBudgets() {
  }
}
