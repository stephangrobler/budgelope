import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TransactionsComponent } from './transactions.component';

const app_routes: Routes = [
  { path: 'transactions', component: TransactionsComponent },
  { path: '**', pathMatch: 'full', redirectTo: 'transactions' }
];



@NgModule({
  imports: [ RouterModule.forRoot(app_routes) ],
  exports: [ RouterModule ],
  declarations: [],
  providers: []
})
export class TransactionRoutingModule { }
