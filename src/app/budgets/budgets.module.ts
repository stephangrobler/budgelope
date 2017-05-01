import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BudgetsRoutingModule } from './budgets-routing.module';
import { BudgetsComponent } from './budgets.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    BudgetsRoutingModule
  ],
  declarations: [
    BudgetsComponent
  ],
  providers: []
})
export class BudgetsModule { }
