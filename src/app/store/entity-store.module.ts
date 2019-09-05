import { NgModule } from '@angular/core';
import { EntityDataService } from '@ngrx/data'; // <-- import the NgRx Data data service registry
import { TransactionDataService } from './entity/transaction-data-service';


@NgModule({
  imports: [],
  providers: [ TransactionDataService ] // <-- provide the data service
})
export class EntityStoreModule {
  constructor(
    entityDataService: EntityDataService,
    transactionDataService: TransactionDataService,
  ) {
    entityDataService.registerService('Transaction', transactionDataService); // <-- register it
  }
}
