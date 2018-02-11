import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HomeComponent } from '../home/home.component';
import { ErrorComponent } from '../error/error.component';
import { LoginComponent } from '../login/login.component';
import { SignUpComponent } from '../signup/signup.component';
import { AccountListComponent } from '../accounts/account-list/account-list.component';
import { AccountComponent } from '../accounts/account/account.component';


import { BudgetviewComponent } from '../budgets/budgetview/budgetview.component';
import {TransactionComponent} from '../transactions/transaction/transaction.component';
import {TransactionsComponent} from '../transactions/transactions.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: '', component: HomeComponent, children: [
        { path: "budgetview", component: BudgetviewComponent },
        { path: 'transactions/:accountId', component: TransactionsComponent},
        { path: 'transactions', component: TransactionsComponent},
        { path: 'transaction/:id', component: TransactionComponent },
      ] },

      // Accounts
      { path: 'accounts', component: AccountListComponent },
      { path: 'account/:id', component: AccountComponent },
      { path: 'account', component: AccountComponent },

      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignUpComponent },
      // { path: '**', component: ErrorComponent }
    ])
  ],
  exports: [
    RouterModule
  ]
})

export class AppRoutingModule { }
