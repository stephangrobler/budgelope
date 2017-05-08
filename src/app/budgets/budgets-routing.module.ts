import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BudgetsComponent } from './budgets.component';
import { BudgetComponent } from './budget/budget.component';
import { BudgetviewComponent } from './budgetview/budgetview.component';
import { BudgetListComponent } from './budgetlist/budgetlist.component';

const routes: Routes = [
  {path: "budgets", component: BudgetsComponent},
  {path: "budgetview", component: BudgetviewComponent},
  {path: "budget/:id", component: BudgetComponent}
];

@NgModule({
  imports: [ RouterModule.forRoot(routes)  ],
  exports: [ RouterModule ]
})
export class BudgetsRoutingModule { }
