import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HomeComponent } from '../home/home.component';
import { ErrorComponent } from '../error/error.component';
import { LoginComponent } from '../login/login.component';
import { SignUpComponent } from '../signup/signup.component';
import { AccountListComponent } from '../accounts/account-list/account-list.component';
import { AccountComponent } from '../accounts/account/account.component';

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: '', component: LoginComponent },
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
