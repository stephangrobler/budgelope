import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AccountComponent } from './account/account.component';
import { AccountService } from './accountShared/account.service';
import { AccountListComponent } from './account-list/account-list.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [

    AccountComponent,
    AccountListComponent
  ],
  providers: [
    AccountService
  ]
})
export class AccountsModule { }
