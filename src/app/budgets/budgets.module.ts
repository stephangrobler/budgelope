import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {MatListModule, MatIconModule} from '@angular/material';
import {MatGridListModule, MatCardModule, MatInputModule, MatButtonModule} from '@angular/material';
import { NgxDnDModule } from '@swimlane/ngx-dnd';

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
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    NgxDnDModule
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
