import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatTableModule, MatCheckboxModule, MatIconModule, MatInputModule, MatRadioModule,
  MatDatepickerModule, MatSelectModule, MatCardModule, MatButtonModule, MatAutocompleteModule} from '@angular/material';
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
    MatTableModule,
    MatCheckboxModule,
    MatInputModule,
    MatRadioModule,
    MatDatepickerModule,
    MatSelectModule,
    MatCardModule,
    MatButtonModule,
    NgxDatatableModule,
    MatIconModule,
    MatAutocompleteModule
  ],
  declarations: [
    TransactionsComponent,
    TransactionComponent,
  ],
  providers: []
})
export class TransactionModule { }
