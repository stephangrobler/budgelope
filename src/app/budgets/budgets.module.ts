import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {MdListModule} from '@angular/material';
import {MdGridListModule, MdCardModule, MdInputModule} from '@angular/material';

import { BudgetsRoutingModule } from './budgets-routing.module';
import { BudgetsComponent } from './budgets.component';
import { BudgetComponent } from './budget/budget.component';
import { BudgetListComponent } from './budgetlist/budgetlist.component';
import { BudgetService } from '../core/budget.service';
import { SharedModule } from '../shared/shared.module';
import { BudgetviewComponent } from './budgetview/budgetview.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    BudgetsRoutingModule,
    FormsModule,
    MdListModule,
    MdGridListModule,
    MdCardModule,
    MdInputModule
  ],
  declarations: [
    BudgetsComponent,
    BudgetComponent,
    BudgetListComponent,
    BudgetviewComponent
  ],
  providers: [

  ]
})
export class BudgetsModule { }
