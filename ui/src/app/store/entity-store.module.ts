import { NgModule } from '@angular/core';
import { DefaultDataServiceConfig, EntityDataService } from '@ngrx/data'; // <-- import the NgRx Data data service registry
import { environment } from 'environments/environment';

const defaultDataServiceConfig: DefaultDataServiceConfig = {
  root: environment.apiUrl,
  timeout: 3000, // request timeout
};
@NgModule({
  imports: [],
  providers: [
    { provide: DefaultDataServiceConfig, useValue: defaultDataServiceConfig },
  ], // <-- provide the data service
})
export class EntityStoreModule {
  constructor(entityDataService: EntityDataService) {
    entityDataService.registerServices({}); // <-- register it
  }
}
