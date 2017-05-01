import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BudgetsComponent } from './budgets.component';
import { BudgetComponent } from './budget/budget.component';

const routes: Routes = [
  {path: "budgets", component: BudgetsComponent},
  {path: "budget/:id", component: BudgetComponent}
];

@NgModule({
  imports: [ RouterModule.forRoot(routes)  ],
  exports: [ RouterModule ]
})
export class BudgetsRoutingModule { }
