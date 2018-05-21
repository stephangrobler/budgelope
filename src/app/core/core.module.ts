import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NavComponent } from './navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import { AppRoutingModule } from '../shared/app-routing.module';
import { BudgetService } from './budget.service';
import { CategoryService } from './category.service';
import { TransactionService } from './transaction.service';
import { AccountService } from './account.service';
import { AnalyticsService } from './analytics.service';
import { UserService } from './user.service';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    HomeComponent,
    NavComponent
  ],
  exports: [
    NavComponent,
    AppRoutingModule
  ],
  imports: [
    AppRoutingModule,
    CommonModule,
    SharedModule
  ],
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
