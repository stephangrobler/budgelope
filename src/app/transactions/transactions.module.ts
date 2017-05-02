import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { TransactionRoutingModule } from './transaction-routing.module';
import { SharedModule } from '../shared/shared.module';

import { TransactionsComponent } from './transactions.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TransactionRoutingModule,
    SharedModule
  ],
  declarations: [
    TransactionsComponent
  ],
  providers: []
})
export class TransactionModule { }
