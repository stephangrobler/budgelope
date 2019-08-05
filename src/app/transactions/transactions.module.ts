import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { SharedModule } from '../shared/shared.module';

import { TransactionsComponent } from './transactions.component';
import { TransactionComponent } from './transaction/transaction.component';
import { ImportComponent } from './import/import.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  declarations: [
    TransactionsComponent,
    TransactionComponent,
    ImportComponent,
  ],
  entryComponents: [
    ImportComponent
  ],
  providers: []
})
export class TransactionModule { }
