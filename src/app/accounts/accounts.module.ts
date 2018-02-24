import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AccountComponent } from './account/account.component';
import { AccountListComponent } from './account-list/account-list.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    SharedModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [

    AccountComponent,
    AccountListComponent
  ]

})
export class AccountsModule { }
