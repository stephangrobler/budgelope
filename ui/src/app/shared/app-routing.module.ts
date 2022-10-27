import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from '../core/home/home.component';
import { ErrorComponent } from '../error/error.component';
import { LoginComponent } from '../login/login.component';
import { SignUpComponent } from '../signup/signup.component';
import { AccountComponent } from '../accounts/account/account.component';
import { AuthGuardService } from './auth-guard.service';

import { BudgetviewComponent } from '../budgetview/budgetview.component';
import { TransactionsComponent } from '../transactions/transactions.component';
import { CategoriesComponent } from '../categories/categories.component';
import { CategoryComponent } from '../categories/category/category.component';
import { BudgetComponent } from '../budgets/budget/budget.component';

const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'app',
    component: HomeComponent,
    canActivate: [AuthGuardService],
    children: [
      { path: 'budget-create', component: BudgetComponent },
      { path: 'budget', component: BudgetviewComponent },
      { path: 'budget/:month', component: BudgetviewComponent },
      { path: 'transactions/:id', component: TransactionsComponent },
      { path: 'transactions', component: TransactionsComponent },
      { path: 'account/:id', component: AccountComponent },
      { path: 'categories', component: CategoriesComponent },
      { path: 'category/:id', component: CategoryComponent }
    ]
  },
  { path: 'signup', component: SignUpComponent },
  { path: '**', component: ErrorComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
