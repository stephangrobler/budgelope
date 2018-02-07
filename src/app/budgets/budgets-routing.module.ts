import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BudgetsComponent } from './budgets.component';
import { BudgetComponent } from './budget/budget.component';
import { BudgetviewComponent } from './budgetview/budgetview.component';
import { BudgetListComponent } from './budgetlist/budgetlist.component';
import { TransactionsComponent } from '../transactions/transactions.component';
import { TransactionComponent } from '../transactions/transaction/transaction.component';

const routes: Routes = [
  {path: "budgets", component: BudgetsComponent},
  {path: "budgetview", component: BudgetviewComponent, children: [
    { path: 'transactions', component: TransactionsComponent},
    { path: 'transaction/:id', component: TransactionComponent },
  ]},
  {path: "budget/:id", component: BudgetComponent}
];

@NgModule({
  imports: [ RouterModule.forRoot(routes)  ],
  exports: [ RouterModule ]
})
export class BudgetsRoutingModule { }
