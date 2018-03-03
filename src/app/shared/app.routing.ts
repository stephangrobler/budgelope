import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HomeComponent } from '../home/home.component';
import { ErrorComponent } from '../error/error.component';
import { LoginComponent } from '../login/login.component';
import { SignUpComponent } from '../signup/signup.component';
import { AccountListComponent } from '../accounts/account-list/account-list.component';
import { AccountComponent } from '../accounts/account/account.component';
import { AuthGuardService } from '../core/auth-guard.service';

import { BudgetviewComponent } from '../budgets/budgetview/budgetview.component';
import {TransactionComponent} from '../transactions/transaction/transaction.component';
import {TransactionsComponent} from '../transactions/transactions.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: '',  redirectTo: 'app', pathMatch: 'full'},
      {path: 'app', component: HomeComponent, canActivate: [AuthGuardService], children: [
        { path: "budget", component: BudgetviewComponent },
        { path: 'transactions', component: TransactionsComponent},
        { path: 'accounts', component: AccountListComponent },
      ] },
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignUpComponent },
      { path: '**', component: ErrorComponent }
    ], { enableTracing: true })
  ],
  exports: [
    RouterModule
  ]
})

export class AppRoutingModule { }
