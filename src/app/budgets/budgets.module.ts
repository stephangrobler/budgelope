import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BudgetComponent } from './budget/budget.component';
import { BudgetsComponent } from './budgets.component';
import { SharedModule } from '../shared/shared.module';
import { BudgetviewComponent } from '../budgetview/budgetview.component';
import { AppRoutingModule } from '../shared/app-routing.module';

@NgModule({
  imports: [CommonModule, SharedModule, FormsModule, AppRoutingModule],
  declarations: [ BudgetComponent, BudgetsComponent, BudgetviewComponent],
  providers: []
})
export class BudgetsModule {}
