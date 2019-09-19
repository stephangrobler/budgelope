import { NgModule } from '@angular/core';
import { EntityDataService } from '@ngrx/data'; // <-- import the NgRx Data data service registry
import { TransactionDataService } from './entity/transaction-data-service';
import { CategoryDataService } from './entity/category-data.service';
import { BudgetDataService } from './entity/budget-data.service';
import { AccountDataService } from './entity/account-data.service';

@NgModule({
  imports: [],
  providers: [TransactionDataService] // <-- provide the data service
})
export class EntityStoreModule {
  constructor(
    entityDataService: EntityDataService,
    transactionDataService: TransactionDataService,
    categoryDataService: CategoryDataService,
    budgetDataService: BudgetDataService,
    accountDataService: AccountDataService
  ) {
    entityDataService.registerServices({
      Transaction: transactionDataService,
      Category: categoryDataService,
      Budget: budgetDataService,
      Account: accountDataService
    }); // <-- register it
  }
}
