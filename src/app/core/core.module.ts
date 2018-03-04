import { NgModule } from '@angular/core';

import { BudgetService } from './budget.service';
import { CategoryService } from './category.service';
import { TransactionService } from './transaction.service';
import { AccountService } from './account.service';
import { AnalyticsService } from './analytics.service';
import { UserService } from './user.service';

@NgModule({
  imports: [],
  declarations: [],
  providers: [
    BudgetService,
    CategoryService,
    TransactionService,
    AccountService,
    AnalyticsService,
    UserService
  ]
})
export class CoreModule { }
