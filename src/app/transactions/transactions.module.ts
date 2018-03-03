import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatTableModule, MatCheckboxModule, MatIconModule, MatInputModule, MatRadioModule,
  MatDatepickerModule, MatSelectModule, MatCardModule, MatButtonModule, MatAutocompleteModule,
  MatSnackBarModule} from '@angular/material';

import { SharedModule } from '../shared/shared.module';

import { TransactionsComponent } from './transactions.component';
import { TransactionComponent } from './transaction/transaction.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    MatTableModule,
    MatCheckboxModule,
    MatInputModule,
    MatRadioModule,
    MatDatepickerModule,
    MatSelectModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatSnackBarModule
  ],
  declarations: [
    TransactionsComponent,
    TransactionComponent,
  ],
  providers: []
})
export class TransactionModule { }
