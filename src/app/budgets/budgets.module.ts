import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


import { BudgetsRoutingModule } from './budgets-routing.module';
import { BudgetsComponent } from './budgets.component';
import { BudgetComponent } from './budget/budget.component';
import { BudgetListComponent } from './budgetlist/budgetlist.component';
import { BudgetService } from './budgetShared/budget.service';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    BudgetsRoutingModule,
    FormsModule
  ],
  declarations: [
    BudgetsComponent,
    BudgetComponent,
    BudgetListComponent
  ],
  providers: [
    BudgetService
  ]
})
export class BudgetsModule { }
