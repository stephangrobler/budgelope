import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import {MdCheckboxModule,MdIconModule, MdInputModule, MdRadioModule, MdDatepickerModule, MdSelectModule, MdCardModule, MdButtonModule, MdAutocompleteModule} from '@angular/material';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { TransactionRoutingModule } from './transaction-routing.module';
import { SharedModule } from '../shared/shared.module';

import { TransactionsComponent } from './transactions.component';
import { TransactionComponent } from './transaction/transaction.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TransactionRoutingModule,
    SharedModule,
    MdCheckboxModule,
    MdInputModule,
    MdRadioModule,
    MdDatepickerModule,
    MdSelectModule,
    MdCardModule,
    MdButtonModule,
    NgxDatatableModule,
    MdIconModule,
    MdAutocompleteModule
  ],
  declarations: [
    TransactionsComponent,
    TransactionComponent,
  ],
  providers: []
})
export class TransactionModule { }
