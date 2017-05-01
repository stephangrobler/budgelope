import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { BudgetsComponent } from './budgets.component';

const routes: Routes = [
  {path: "budgets", component: BudgetsComponent}
];

@NgModule({
  imports: [ RouterModule.forRoot(routes)  ],
  exports: [ RouterModule ],
  declarations: [],
  providers: []
})
export class BudgetsRoutingModule { }
