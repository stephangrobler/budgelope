import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BudgetsComponent } from './budgets.component';
import { BudgetComponent } from './budget/budget.component';
import { BudgetListComponent } from './budgetlist/budgetlist.component';

@NgModule({
  imports: [  ],
  exports: [ RouterModule ]
})
export class BudgetsRoutingModule { }
