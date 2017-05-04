import { NgModule } from '@angular/core';

import { BudgetService } from './budget.service';
import { CategoryService } from './category.service';
import { TransactionService } from './transaction.service';

@NgModule({
  imports: [],
  declarations: [],
  providers: [
    BudgetService,
    CategoryService,
    TransactionService
  ]
})
export class CoreModule { }
