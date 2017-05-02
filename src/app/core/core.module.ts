import { NgModule } from '@angular/core';

import { BudgetService } from './budget.service';
import { CategoryService } from './category.service';


@NgModule({
  imports: [],
  declarations: [],
  providers: [
    BudgetService,
    CategoryService
  ]
})
export class CoreModule { }
