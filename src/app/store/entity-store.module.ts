import { NgModule } from '@angular/core';
import { EntityDataService } from '@ngrx/data'; // <-- import the NgRx Data data service registry
import { TransactionDataService } from './entity/transaction-data-service';
import { CategoryDataService } from './entity/category-data.service';


@NgModule({
  imports: [],
  providers: [ TransactionDataService ] // <-- provide the data service
})
export class EntityStoreModule {
  constructor(
    entityDataService: EntityDataService,
    transactionDataService: TransactionDataService,
    categoryDataService: CategoryDataService
  ) {
    entityDataService.registerService('Transaction', transactionDataService); // <-- register it
    entityDataService.registerService('Category', categoryDataService); // <-- register it
  }
}
